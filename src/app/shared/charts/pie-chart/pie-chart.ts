import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

type ChartData = {
  values: number[];
  labels?: string[];
};

@Component({
  selector: 'pie-chart',
  imports: [],
  templateUrl: './pie-chart.html',
})
export class PieChart {

  @ViewChild('pieChart', { static: true }) pieChartRef!: ElementRef<HTMLDivElement>;

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

  // Get the CSS variable --color-brand and convert it to hex for ApexCharts
  getBrandColor = () => {
    // Get the computed style of the document's root element
    const computedStyle = getComputedStyle(document.documentElement);

    // Get the value of the --color-brand CSS variable
    return computedStyle.getPropertyValue('--color-fg-brand').trim() || "#4556D4";
  };

  getBrandSecondaryColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-fg-brand-subtle').trim() || "#459DD4";
  };

  getBrandTertiaryColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-fg-brand-strong').trim() || "#45D4C3";
  };

  getNeutralPrimaryColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-neutral-primary').trim() || "#ffffff";
  };


  ngAfterViewInit() {
    if (document.getElementById("pie-chart") && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(this.pieChartRef.nativeElement, this.getChartOptions());
      this.chart.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private getChartOptions = () => {
    const brandColor = this.getBrandColor();
    const brandSecondaryColor = this.getBrandSecondaryColor();
    const brandTertiaryColor = this.getBrandTertiaryColor();
    const neutralPrimaryColor = this.getNeutralPrimaryColor();
    return {
      series: [52.8, 26.8, 20.4],
      colors: [brandColor, brandSecondaryColor, brandTertiaryColor],
      chart: {
        height: 420,
        width: "100%",
        type: "pie",
      },
      stroke: {
        colors: [neutralPrimaryColor],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
          },
          size: "100%",
          dataLabels: {
            offset: -25
          }
        },
      },
      labels: ["Direct", "Organic search", "Referrals"],
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value: any) {
            return  `$${value}`
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: any) {
            return `${value}%`
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    }
  }

}
