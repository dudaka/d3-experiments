export interface CandlestickSeriesOptions {
  className: string;
  wickClassName: string;
  candleClassName: string;
  widthRatio: number;
  width: number | Function;
  classNames: Function | string;
  fill: Function | string;
  stroke: Function | string;
  wickStroke: Function | string;
  yAccessor: Function;
  clip: boolean;
}
