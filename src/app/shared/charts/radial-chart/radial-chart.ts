import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'radial-chart',
  imports: [CurrencyPipe],
  templateUrl: './radial-chart.html',
})
export class RadialChart {
  title = 'Balance de ahorro'
  totalIncome = input.required<number>();
  totalExpenses = input.required<number>();

  isDeficit = computed(() => {
    return this.totalExpenses() > this.totalIncome() ? true : false;
  })


  percent = computed(() => {
    let percent = 0;
    if (this.isDeficit()) {
      percent = !this.totalIncome() ? 100 : (this.totalExpenses() / this.totalIncome()) * 100 - 100;
      return percent.toFixed(2);

    }
    const balance = this.totalIncome() - this.totalExpenses();
    percent = (balance / this.totalIncome()) * 100;
    return percent.toFixed(2);
  });

}
