export interface ChartCanvasOptions {
  className: string;
  zIndex: number;
  height: number;
  width: number;
  margin: {left: number, right: number, top: number, bottom: number};
  data: any[];
  xAccessor: Function;
  xScale: Function;
  xExtents: any[];
}
