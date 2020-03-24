import { ChartComponent } from '../chart-component';
import * as d3 from 'd3';
import { CandlestickSeriesOptions } from '../models/candlestick-series-options';
import { candlestickSeriesOptionsDefaults } from '../options/candlestick-series-options-defaults';

export class CandlestickSeries extends ChartComponent {

  constructor(options?: any) {
    super();

    this.options = {
      ...candlestickSeriesOptionsDefaults,
      ...options
    };

  }
}
