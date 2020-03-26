import { chartOptionDefaults } from '../options/chart-options-defaults';

import { CandlestickSeries } from '../series/candlestick-series';

import { Selection } from 'd3-selection';
import { find } from '../utils';

export class Chart {

  private chartOptions: any;
  private context: any;
  private chartComponentsG: Selection<SVGGElement, unknown, null, undefined>;

  constructor(selection: Selection<SVGGElement, unknown, null, undefined>, context: any, options?: any) {

    this.chartOptions = {
      ...chartOptionDefaults,
      ...options
    };

    this.context = context;

    this.render(selection);
  }

  addCandleStickSeries(options?: any) {
    const { chartConfigs, ...context } = this.context;
    const newContext = {
      ...context,
      ...find(this.context.chartConfigs, each => each.id === this.chartOptions.id)
    };
    const candlestickSeries = new CandlestickSeries(this.chartComponentsG, newContext, options);
  }

  private render(selection: Selection<SVGGElement, unknown, null, undefined>) {

    const { origin } = find(this.context.chartConfigs, each => each.id === this.chartOptions.id);

    const [x, y] = origin as any[];

    this.chartComponentsG = selection.append('g')
      .attr('transform', `translate(${ x }, ${ y })`);
  }
}
