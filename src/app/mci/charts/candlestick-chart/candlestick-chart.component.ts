import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { tsv as d3Tsv } from 'd3-fetch';
import { timeParse as d3TimeParse } from 'd3-time-format';
import { scaleTime as d3ScaleTime } from 'd3-scale';
import { utcDay as d3UtcDay } from 'd3-time';

import { last } from '../../lib/utils';
import { ChartCanvas } from '../../lib/api/chart-canvas';
import { timeIntervalBarWidth } from '../../lib/utils/barWidth';
import { createChartCanvas } from '../../lib/api/create-chart-canvas';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'candlestick-chart',
  templateUrl: './candlestick-chart.component.html',
  styleUrls: ['./candlestick-chart.component.scss']
})
export class CandlestickChartComponent implements OnInit {

  // @ViewChild('chartCanvas', { static: true }) private chartCanvasEl: ElementRef;
  options: any;

  constructor() {
    d3Tsv('assets/data/MSFT.tsv').then((rows: d3.DSVRowArray<string>) => {
      const parseDate = d3TimeParse('%Y-%m-%d');

      const data = rows.map((d: any) => {
        d.date = parseDate(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;

        return d;
      });

      const xAccessor = (d: any) => d.date;

      this.options = {
        data,
        width: 960,
        height: 500,
        margin: { left: 50, right: 50, top: 10, bottom: 30 },
        xAccessor,
        xScale: d3ScaleTime(),
        xExtents: [
          xAccessor(last(data)),
          xAccessor(data[data.length - 100])
        ]
      };

    });
  }

  ngOnInit(): void { }

  private buildChartCanvas(data: any[]) {
    const xAccessor = (d: any) => d.date;
    this.options = {
      data,
      width: 960,
      height: 500,
      margin: { left: 50, right: 50, top: 10, bottom: 30 },
      xAccessor,
      xScale: d3ScaleTime(),
      xExtents: [
        xAccessor(last(data)),
        xAccessor(data[data.length - 100])
      ]
    };
    // return createChartCanvas(this.chartCanvasEl.nativeElement, data, options);
  }

  private buildChart(chartCanvas: ChartCanvas) {

    const chartOptions = {
      id: 1,
      yExtents: (d: any) => [d.high, d.low]
    };

    const chart = chartCanvas.addChart(chartOptions);

    // const xAxisOptions = {
    //   axisAt: 'bottom',
    //   orient: 'bottom',
    //   ticks: 6
    // };
    // chart.addXAxis(xAxisOptions);

    // const yAxisOptions = {
    //   axisAt: 'left',
    //   orient: 'left',
    //   ticks: 5
    // };
    // chart.addYAxis(yAxisOptions);

    const candlestickSeriesOptions = {
      width: timeIntervalBarWidth(d3UtcDay)
    };
    chart.addCandleStickSeries(candlestickSeriesOptions);
  }

  onSelect() {
    console.log('TODO');
  }

}
