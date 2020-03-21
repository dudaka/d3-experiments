
export interface ChartOptions {
  height: number;
  origin: any[] | Function;
  id: number | string;
  yExtents: any[] | Function;
  yExtentsCalculator: Function;
  onContextMenu: Function;
  yScale: d3.ScaleLinear<number, number>;
  flipYScale: boolean;
  padding: number | { top: number, bottom: number};
  yPan: boolean;
	yPanEnabled: boolean;
}
