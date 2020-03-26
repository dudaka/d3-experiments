import { candlestickSeriesOptionsDefaults } from '../options/candlestick-series-options-defaults';

import { Selection } from 'd3-selection';
import { GenericComponent } from '../api/generic-component';

export class CandlestickSeries {

  private options: any;
  private context: any;

  constructor(node: Selection<SVGGElement, unknown, null, undefined>, context: any, options?: any) {

    this.options = {
      ...candlestickSeriesOptionsDefaults,
      ...options
    };

    this.context = context;

    const component = new GenericComponent();
    component.draw();
  }

  private renderSVG() {

  }
}
