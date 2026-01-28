import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { TransactionsDataService } from '@services/transactions-data.service';
import { of } from 'rxjs';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { CurrencyPipe } from '@angular/common';
import { DonutChart } from "@shared/charts/donut-chart/donut-chart";
import { PieChart } from "@shared/charts/pie-chart/pie-chart";
import { Transactions } from '@interfaces/transactions.interface';

type BarItem = { label: string; value: number; maxValue: number };


@Component({
  selector: 'app-statistics-page',
  imports: [CurrencyPipe, DonutChart, PieChart],
  templateUrl: './statistics-page.html',
})
export default class StatisticsPage {

  authService = inject(AuthService);
  transactionsDataService = inject(TransactionsDataService);

  monthOffset = signal(0);   // 0 = mes actual, 1 = mes anterior, 2 = hace 2 meses...

  private isSameMonth(fechaStr: string, monthIndex: number, year: number): boolean {
    // fechaStr = "2025-11-02"
    const [y, m] = fechaStr.split('-').map(Number); // y = 2025, m = 11
    return y === year && (m - 1) === monthIndex;
  }

  cardsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadCards(params.token, params.userId);
    },
  });

  transactionsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadTransactions(params.token, params.userId);
    },
  });

  barsTableData = computed(() => {
    const paymentData: PaymentMethod[] = this.cardsResource.value() ?? [];
    const tableData = paymentData
      .filter(card => card.accInfo.paymentType === 'credit')
      .map(t => ({
        cardLabel: `${t.accInfo.bankName} ${t.accInfo.productName}`,
        value: `${t.balanceInfo.balance}`,
        creditLine: t.balanceInfo.creditLine,
        percent: `${((+t.balanceInfo.balance / +t.balanceInfo.creditLine) * 100).toFixed(2)}%`,
        overdraft: +t.balanceInfo.balance > t.balanceInfo.creditLine ? true : false
      }))
    return tableData;
  });

  donutChartData = computed(() => {
    const paymentData: PaymentMethod[] = this.cardsResource.value()?.filter(card => card.accInfo.paymentType === 'debit') ?? [];
    const valuesArr = paymentData
      .map(data => +data.balanceInfo.balance);
    const labelsArr = paymentData
      .map(data => `${data.accInfo.bankName} ${data.accInfo.productName}`);

    const data = {
      values: valuesArr,
      labels: labelsArr

    }
    return data;
  });



  pieChartData = computed(() => {
    const transactions = this.transactionsResource.value() ?? [];

    const today = new Date();
    today.setMonth(today.getMonth() - this.monthOffset());
    const actualMonth = today.getMonth();     // 0-11
    const actualYear = today.getFullYear();

    // 1) filtra el mes y SOLO gastos
    const monthExpenses = transactions
      .filter(t => this.isSameMonth(t.operationDate, actualMonth, actualYear))
      .filter(t => t.transactionType === 'outgoing');

    // 2) agrupa por categoría y suma montos
    const totalsByCategory = new Map<string, number>();

    for (const t of monthExpenses) {
      const category = t.category ?? 'Sin categoría';
      const amount = Number(t.amount) || 0;

      totalsByCategory.set(category, (totalsByCategory.get(category) ?? 0) + amount);
    }

    // 3) convierte a arrays (labels + values)
    const labels = Array.from(totalsByCategory.keys());
    const values = Array.from(totalsByCategory.values());

    return { labels, values };
  });
}
