import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { last } from '../lib/utils';
import { ChartCanvas } from '../lib/chart-canvas';
import { Chart } from '../lib/chart';
import { ChartComponent } from '../lib/chart-component';
import { XAxis } from '../lib/axes/XAxis';
import { YAxis } from '../lib/axes/YAxis';
import { timeIntervalBarWidth } from '../lib/utils/barWidth';
import { CandlestickSeries } from '../lib/series/candlestick-series';

@Component({
  selector: 'app-candlestick-chart',
  templateUrl: './candlestick-chart.component.html',
  styleUrls: ['./candlestick-chart.component.scss']
})
export class CandlestickChartComponent implements OnInit {

  @ViewChild('chartCanvas', { static: true }) private chartCanvasEl: ElementRef;
  private chartCanvas: ChartCanvas;

  constructor() { }

  ngOnInit(): void {

    d3.tsv('assets/data/MSFT.tsv').then((rows: d3.DSVRowArray<string>) => {
      const parseDate = d3.timeParse('%Y-%m-%d');

      const data = rows.map((d: any) => {
        d.date = parseDate(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;

        return d;
      });

      this.buildChartCanvas(data);
    });
  }

  private buildChartCanvas(data: any[]) {
    const xAccessor = (d: any) => d.date;
    const chartCanvasParams = {
      data,
      width: 960,
      height: 500,
      margin: { left: 50, right: 50, top: 10, bottom: 30 },
      xAccessor,
      xScale: d3.scaleTime(),
      xExtents: [
        xAccessor(last(data)),
        xAccessor(data[data.length - 100])
      ]
    };
    const charts: Chart[] = [];
    const chart = this.buildChart();
    charts.push(chart);

    const chartCanvas = ChartCanvas.getInstance();
    chartCanvas.build(this.chartCanvasEl.nativeElement, charts, chartCanvasParams);
  }

  private buildChart() {
    const chartParams = {
      id: 1,
      yExtents: (d: any) => [d.high, d.low]
    };
    const chartComponents: ChartComponent[] = [];

    const xAxisParams = {
      axisAt: 'bottom',
      orient: 'bottom',
      ticks: 6
    };
    const xAxis = new XAxis(xAxisParams);
    chartComponents.push(xAxis);

    const yAxisParams = {
      axisAt: 'left',
      orient: 'left',
      ticks: 5
    };
    const yAxis = new YAxis(yAxisParams);
    chartComponents.push(yAxis);

    const candlestickSeriesParams = {
      width: timeIntervalBarWidth(d3.utcDay)
    };
    const candlestickSeries = new CandlestickSeries(candlestickSeriesParams);
    chartComponents.push(candlestickSeries);

    return new Chart(chartComponents, chartParams);
  }

  onSelect() {
    console.log('TODO');
  }

}
