import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { last } from '../lib/utils';
import { ChartCanvas } from '../lib/chart-canvas';

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

      this.chartCanvas = new ChartCanvas(this.chartCanvasEl.nativeElement, chartCanvasParams);
    });
  }

  onSelect() {
    console.log('TODO');
  }

}
