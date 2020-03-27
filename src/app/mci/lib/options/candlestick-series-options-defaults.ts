import { plotDataLengthBarWidth } from '../utils/barWidth';

export const candlestickSeriesOptionsDefaults = {
  className: 'candlestick',
  wickClassName: 'candlestick-wick',
  candleClassName: 'candlestick-candle',
  yAccessor: d => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
  classNames: d => d.close > d.open ? 'up' : 'down',
  width: plotDataLengthBarWidth,
  wickStroke: '#000000',
  // wickStroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
  fill: d => d.close > d.open ? '#6BA583' : '#FF0000',
  // stroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
  stroke: '#000000',
  candleStrokeWidth: 0.5,
  // stroke: "none",
  widthRatio: 0.8,
  opacity: 0.5,
  clip: true,
};
