import { CandlestickSeriesOptions } from './models/candlestick-series-options';

export class ChartComponent {

  protected options: CandlestickSeriesOptions | any;

  render(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
    console.log(this.options);
  }

}
