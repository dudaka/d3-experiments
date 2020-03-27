import { chartOptionDefaults } from '../options/chart-options-defaults';

import { CandlestickSeries } from '../series/candlestick-series';

import { Selection } from 'd3-selection';
import { find } from '../utils';
import { XAxis } from '../axes/XAxis';

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

  addXAxis(options?: any) {
    const newContext = this.getContext();
    return new XAxis(this.chartComponentsG, newContext, options);
  }

  addCandleStickSeries(options?: any) {
    const newContext = this.getContext();
    // console.log(newContext);
    return new CandlestickSeries(this.chartComponentsG, newContext, options);
  }

  private getContext() {
    const { chartConfigs, ...context } = this.context;
    const chartConfig = find(this.context.chartConfigs, each => each.id === this.chartOptions.id);
    // console.log(chartConfig);
    const newContext = {
      ...context,
      chartConfig,
      chartId: chartConfig.id
    };
    return newContext;
  }

  private render(selection: Selection<SVGGElement, unknown, null, undefined>) {

    const { origin } = find(this.context.chartConfigs, each => each.id === this.chartOptions.id);

    const [x, y] = origin as any[];

    this.chartComponentsG = selection.append('g')
      .attr('transform', `translate(${ x }, ${ y })`);
  }
}
