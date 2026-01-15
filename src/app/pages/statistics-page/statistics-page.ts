import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { TransactionsDataService } from '@services/transactions-data.service';
import { of } from 'rxjs';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { CurrencyPipe } from '@angular/common';
import { DonutChart } from "@shared/charts/donut-chart/donut-chart";

type BarItem = { label: string; value: number; maxValue: number };


@Component({
  selector: 'app-statistics-page',
  imports: [CurrencyPipe, DonutChart],
  templateUrl: './statistics-page.html',
})
export default class StatisticsPage {

  authService = inject(AuthService);
  transactionsDataService = inject(TransactionsDataService);




  cardsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadCards(params.token, params.userId);
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
}
