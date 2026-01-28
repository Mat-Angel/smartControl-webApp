import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { TransactionsDataService } from '@services/transactions-data.service';
import { of } from 'rxjs';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { CurrencyPipe } from '@angular/common';
import { DonutChart } from "@shared/charts/donut-chart/donut-chart";
import { PieChart } from "@shared/charts/pie-chart/pie-chart";
import { Transactions, TransactionType } from '@interfaces/transactions.interface';
import { LineChart } from "@shared/charts/line-chart/line-chart";
import { Utils } from '../../utils/utils';

type LabelsChartData = {
  series: Array<{ name: string; data: number[]; color?: string }>;
  categories: string[];
};

@Component({
  selector: 'app-statistics-page',
  imports: [CurrencyPipe, DonutChart, PieChart, LineChart],
  templateUrl: './statistics-page.html',
})
export default class StatisticsPage {
  authService = inject(AuthService);
  transactionsDataService = inject(TransactionsDataService);
  readonly TransactionType = TransactionType;

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


  expensePieChartData = computed(() => {
    const filteredData = this.onFilterPieChartData('outgoing');
    return filteredData;
  });

  incomePieChartData = computed(() => {
    const filteredData = this.onFilterPieChartData('income');
    return filteredData;
  });

  onFilterPieChartData(transactionType: 'income' | 'outgoing') {
    const transactions = this.transactionsResource.value() ?? [];

    const today = new Date();
    today.setMonth(today.getMonth() - this.monthOffset());
    const actualMonth = today.getMonth();     // 0-11
    const actualYear = today.getFullYear();

    // 1) filtra el mes y SOLO gastos
    const monthExpenses = transactions
      .filter(t => this.isSameMonth(t.operationDate, actualMonth, actualYear))
      .filter(t => t.transactionType === transactionType);

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
  }

  private parseAmount(amount: number | string): number {
    const n = typeof amount === 'number' ? amount : Number(amount);
    return Number.isFinite(n) ? n : 0;
  }

  private formatMonthLabel(month0to11: number, year: number): string {
    const yyyy = String(year);
    return `${Utils.MONTHS_ES[month0to11]}-${yyyy}`;
  }

  // Ejemplo: si hoy es 2026-01, devuelve [ {m:0,y:2026}, {m:11,y:2025}, {m:10,y:2025} ]
  private getLastNMonths(n: number): Array<{ m: number; y: number }> {
    const base = new Date();
    base.setDate(1); // estable
    const result: Array<{ m: number; y: number }> = [];

    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setMonth(d.getMonth() - i);
      result.push({ m: d.getMonth(), y: d.getFullYear() });
    }

    return result;
  }

  labelsChartData = computed<LabelsChartData>(() => {
    const transactions: Transactions[] = this.transactionsResource.value() ?? [];

    const months = this.getLastNMonths(3); // [actual, -1, -2]

    const categories = months
      .slice()
      .reverse() // para que quede de antiguo -> actual
      .map(({ m, y }) => this.formatMonthLabel(m, y));

    const incomeData: number[] = [];
    const outgoingData: number[] = [];

    // IMPORTANTe: llenar data en el mismo orden que categories (antiguo -> actual)
    for (const { m, y } of months.slice().reverse()) {
      const monthTx = transactions.filter(t => this.isSameMonth(t.operationDate, m, y));

      const totalIncome = monthTx
        .filter(t => t.transactionType === 'income')
        .reduce((sum, t) => sum + this.parseAmount(t.amount), 0);

      const totalOutgoing = monthTx
        .filter(t => t.transactionType === 'outgoing')
        .reduce((sum, t) => sum + this.parseAmount(t.amount), 0);

      incomeData.push(Number(totalIncome.toFixed(2)));
      outgoingData.push(Number(totalOutgoing.toFixed(2)));
    }

    return {
      series: [
        {
          name: 'Ingresos',
          data: incomeData,
          color: '#39C643',
        },
        {
          name: 'Gastos',
          data: outgoingData,
          color: '#EF5350',
        },
      ],
      categories,
    };
  });

}
