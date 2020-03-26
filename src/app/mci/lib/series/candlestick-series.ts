import { ChartComponent } from '../api/chart-component';
import * as d3 from 'd3';
import { candlestickSeriesOptionsDefaults } from '../options/candlestick-series-options-defaults';

export class CandlestickSeries extends ChartComponent {

  private options: any;

  constructor(options?: any) {
    super();

    this.options = {
      ...candlestickSeriesOptionsDefaults,
      ...options
    };
  }
}
