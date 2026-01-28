import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import ApexCharts from 'apexcharts';

type LabelsChartData = {
  series: Array<{ name: string; data: number[]; color?: string }>;
  categories: string[];
};
@Component({
  selector: 'line-chart',
  imports: [],
  templateUrl: './line-chart.html',
})
export class LineChart {
  @ViewChild('labelsChart', { static: true }) labelsChartRef!: ElementRef<HTMLDivElement>;
  chartData = input.required<LabelsChartData>();

  private chart?: ApexCharts;

  private readonly syncChartEffect = effect(() => {
    const data = this.chartData();
    if (!this.chart) return;

    const series = data.series.length ? data.series : [0, 0, 0, 0];
    this.chart.updateSeries(series);


    if (data.categories?.length) {
      this.chart.updateOptions({ labels: data.categories, chart: { zoom: { enabled: false }, toolbar: { show: false } } }, false, true);
    }
  });

  ngAfterViewInit() {
    if (document.getElementById("labels-chart") && typeof ApexCharts !== 'undefined') {
      console.log('logChart');

      this.chart = new ApexCharts(this.labelsChartRef.nativeElement, this.options);
      this.chart.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  options = {
    // set the labels option to true to show the labels on the X and Y axis
    xaxis: {
      show: true,
      categories: [],
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-body'
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-body'
        },
        formatter: function (value: any) {
          return '$' + value;
        }
      }
    },
    series: [
    ],
    chart: {
      sparkline: {
        enabled: false
      },
      height: "100%",
      width: "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: '#39C643',
        gradientToColors: ['#39C643'],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    legend: {
      show: false
    },
    grid: {
      show: false,
    },
  }
}
