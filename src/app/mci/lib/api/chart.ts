import { ChartComponent } from './chart-component';
import { chartOptionDefaults } from '../options/chart-options-defaults';

import * as d3 from 'd3';
import { CandlestickSeries } from '../series/candlestick-series';

export class Chart {

  private chartOptions: any;
  private chartComponents: ChartComponent[];
  private context: any;

  constructor(context: any, options?: any) {

    this.chartOptions = {
      ...chartOptionDefaults,
      ...options
    };

    this.context = context;
  }

  addCandleStickSeries(candlestickSeriesOptions: { width: (props: any, moreProps: any) => number; }) {
    throw new Error("Method not implemented.");
  }

  render(chartsG: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const { origin } = this.chartOptions;
    const [x, y] = origin as any[];

    const chartComponentsG = chartsG.append('g')
      .attr('transform', `translate(${ x }, ${ y })`);

    // console.log(this.chartComponents);
    this.chartComponents.map(component => {
      // console.log(typeof component);
      if (component instanceof CandlestickSeries) {
        component.render(chartComponentsG);
      }
    });
  }
}
