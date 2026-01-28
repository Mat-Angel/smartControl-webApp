import { Component, ElementRef, ViewChild, effect, input, signal } from '@angular/core';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

type ChartData = {
  values: number[];
  labels?: string[];
};

@Component({
  selector: 'donut-chart',
  imports: [],
  templateUrl: './donut-chart.html',
})
export class DonutChart {
  @ViewChild('donutChart', { static: true }) donutChartRef!: ElementRef<HTMLDivElement>;
  chartData = input.required<ChartData>();

  private chart?: ApexCharts;

  private readonly syncChartEffect = effect(() => {
    const data = this.chartData();
    if (!this.chart) return;

    const series = data.values.length ? data.values : [0, 0, 0, 0];
    this.chart.updateSeries(series);

    if (data.labels?.length) {
      this.chart.updateOptions({ labels: data.labels }, false, true);
    }
  });

  ngAfterViewInit() {
    this.chart = new ApexCharts(this.donutChartRef.nativeElement, this.getChartOptions());
    this.chart.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }


  private getCssVar(name: string, fallback: string) {
    const computedStyle = getComputedStyle(document.documentElement);
    const value = computedStyle.getPropertyValue(name).trim();
    return value || fallback;
  }

  private getChartOptions(): ApexOptions {
    const brandColor = this.getCssVar('--color-fg-brand', '#AB26FE');
    const brandSecondaryColor = this.getCssVar('--color-fg-brand-subtle', '#0083E0');
    const brandTertiaryColor = this.getCssVar('--color-fg-brand-strong', '#E00083');

    return {
      series: this.chartData().values.length ? this.chartData().values : [0, 0, 0, 0],
      colors: [brandColor, brandSecondaryColor, brandTertiaryColor],
      chart: {
        height: 320,
        width: '100%',
        type: 'donut',
      },
      stroke: {
        colors: ['transparent'],
        lineCap: 'butt',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '80%',
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: 20,
              },
              value: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: -20,
                formatter: (value: number) => `$${value}`,
              },
              total: {
                showAlways: true,
                show: true,
                label: 'Saldo Total',
                fontFamily: 'Inter, sans-serif',
                formatter: (w: any) => {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return '$' + sum;
                },
              },
            },
          },
        },
      },
      grid: {
        padding: { top: -2 },
      },
      labels: this.chartData().labels ?? ['A', 'B', 'C', 'D'],
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
      },
      yaxis: {
        labels: { formatter: (value: number) => `$${value}` },
      },
      xaxis: {
        labels: { formatter: (value: any) => `$${value}` },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
    };
  }
}

