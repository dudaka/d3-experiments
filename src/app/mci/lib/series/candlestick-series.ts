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
    this.node = node;

    const { clip } = this.options;
    const componentOptions = {
      clip,
      svgDraw: this.renderSVG,
      drawOn: ['pan']
    };
    // const component = new GenericComponent(this.node, this.context, componentOptions);

    // component.draw();
  }

  @Autobind
  private renderSVG(moreProps: any) {
    const { className, wickClassName, candleClassName } = this.options;
    const { opacity, candleStrokeWidth } = this.options;
    const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

    const candleData = this.getCandleData(xAccessor, xScale, yScale, plotData);

    // console.log(candleData);

    const candlesticks = this.node.append('g').attr('class', className);

    candlesticks.append('g')
      .attr('class', wickClassName)
      .selectAll('path')
      .data(candleData)
      .join('path')
        .attr('class', w => w.className)
        .attr('stroke', w => w.stroke)
        .attr('d', w => {
          // console.log(w);
          const d = w.wick;
          const str = `M${d.x},${d.y1} L${d.x},${d.y2} M${d.x},${d.y3} L${d.x},${d.y4}`;
          // console.log(str);
          return str;
        });


    // console.log(candleData.filter(d => d.width <= 1));
    // console.log(candleData.filter(d => d.width > 1 && d.height === 0));
    // console.log(candleData.filter(d => d.width > 1 && d.height !== 0));
    const candles = candlesticks.append('g').attr('class', candleClassName);

    candles.selectAll('line')
      .data(candleData.filter(c => c.width <= 1))
      .join('line')
        .attr('class', c => c.className)
        .attr('x1', c => c.x)
        .attr('y1', c => c.y)
        .attr('x2', c => c.x)
        .attr('y2', c => c.y + c.height)
        .attr('stroke', c => c.fill);
    candles.selectAll('line')
      .data(candleData.filter(c => c.width > 1 && c.height === 0))
      .join('line')
        .attr('class', c => c.className)
        .attr('x1', c => c.x)
        .attr('y1', c => c.y)
        .attr('x2', c => c.x + c.width)
        .attr('y2', c => c.y + c.height)
        .attr('stroke', c => c.fill);
    candles.selectAll('rect')
      .data(candleData.filter(c => c.width > 1 && c.height !== 0))
      .join('rect')
        .attr('class', c => c.className)
        .attr('fill-opacity', opacity)
        .attr('x', c => c.x)
        .attr('y', c => c.y)
        .attr('width', c => c.width)
        .attr('height', c => c.height)
        .attr('fill', c => c.fill)
        .attr('stroke', c => c.stroke)
        .attr('stroke-width', candleStrokeWidth);

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
