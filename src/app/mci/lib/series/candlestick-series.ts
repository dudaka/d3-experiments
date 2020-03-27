import { candlestickSeriesOptionsDefaults } from '../options/candlestick-series-options-defaults';

import { Selection } from 'd3-selection';
import { GenericComponent } from '../api/generic-component';
import { Autobind } from '../utils/autobind';
import { functor, isDefined } from '../utils';

export class CandlestickSeries {

  private options: any;
  private context: any;
  private node: Selection<SVGGElement, unknown, null, undefined>;

  constructor(node: Selection<SVGGElement, unknown, null, undefined>, context: any, options?: any) {

    this.options = {
      ...candlestickSeriesOptionsDefaults,
      ...options
    };

    this.context = context;

    const { clip } = this.options;

    const componentOptions = {
      clip,
      svgDraw: this.renderSVG
    };

    // console.log(this.context);
    this.node = node;

    const component = new GenericComponent(this.node, this.context, componentOptions);
    component.draw();
  }

  @Autobind
  private renderSVG(moreProps: any) {
    const { className, wickClassName, candleClassName } = this.options;
    const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

    const candleData = this.getCandleData(xAccessor, xScale, yScale, plotData);

    console.log(candleData);

    const candlesticks = this.node.append('g').attr('class', className);
    candlesticks.append('g')
      .attr('class', wickClassName);
    candlesticks.append('g')
      .attr('class', candleClassName);

    // return <g className={ className }>
    //   <g className={ wickClassName } key = "wicks" >
    //     { getWicksSVG(candleData) }
    //     < /g>
    //     < g className = { candleClassName } key = "candles" >
    //       { getCandlesSVG(this.props, candleData) }
    //       < /g>
    //       < /g>;
  }

  private getCandleData(xAccessor, xScale, yScale, plotData) {
    // console.log("[CandlestickSeries - foutside] getCandleData");
    const { wickStroke: wickStrokeProp } = this.options;
    const wickStroke = functor(wickStrokeProp);

    const { classNames, fill: fillProp, stroke: strokeProp, yAccessor } = this.options;;
    const className = functor(classNames);

    const fill = functor(fillProp);
    const stroke = functor(strokeProp);

    const widthFunctor = functor(this.options.width);
    const width = widthFunctor(this.options, {
      xScale,
      xAccessor,
      plotData
    });

    /*
    const candleWidth = Math.round(width);
    const offset = Math.round(candleWidth === 1 ? 0 : 0.5 * width);
    */
    const trueOffset = 0.5 * width;
    const offset = trueOffset > 0.7
      ? Math.round(trueOffset)
      : Math.floor(trueOffset);

    // eslint-disable-next-line prefer-const
    const candles = [];

    for (let i = 0; i < plotData.length; i++) {
      const d = plotData[i];
      if (isDefined(yAccessor(d).close)) {
        const x = Math.round(xScale(xAccessor(d)));
        // const x = Math.round(xScale(xAccessor(d)) - offset);

        const ohlc = yAccessor(d);
        const y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
        const height = Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close)));

        candles.push({
          // type: "line"
          x: x - offset,
          y: y,
          wick: {
            stroke: wickStroke(ohlc),
            x: x,
            y1: Math.round(yScale(ohlc.high)),
            y2: y,
            y3: y + height, // Math.round(yScale(Math.min(ohlc.open, ohlc.close))),
            y4: Math.round(yScale(ohlc.low)),
          },
          height: height,
          width: offset * 2,
          className: className(ohlc),
          fill: fill(ohlc),
          stroke: stroke(ohlc),
          direction: (ohlc.close - ohlc.open),
        });
      }
    }

    return candles;
  }
}
