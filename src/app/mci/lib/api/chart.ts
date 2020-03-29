import { chartOptionDefaults } from '../options/chart-options-defaults';

import { CandlestickSeries } from '../series/candlestick-series';

import { Selection } from 'd3-selection';
import { find } from '../utils';
import { XAxis } from '../axes/XAxis';
import { Autobind } from '../utils/autobind';

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

    const { subscribe } = this.context;
    const { id } = this.chartOptions;
    console.log(subscribe);
    console.log(id);

    subscribe('chart_' + id, { listener: this.listener });

    this.render(selection);
  }

  @Autobind
  private listener(type, moreProps, state, e) {
    console.log('[Chart] - listener');
    const { id, onContextMenu } = this.chartOptions;
    console.log(onContextMenu);

    if (type === 'contextmenu') {
      const { currentCharts } = moreProps;
      if (currentCharts.indexOf(id) > -1) {
        onContextMenu(moreProps, e);
      }
    }
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
      .attr('transform', `translate(${x}, ${y})`);
  }
}
