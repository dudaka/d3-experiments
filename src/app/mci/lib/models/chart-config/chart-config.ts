export interface ChartConfig {
  id: number | string;
  origin: any[] | Function;
  height: number;
  yExtents: any[] | Function;
  yExtentsCalculator?: Function;
  onContextMenu: Function;
  flipYScale: boolean;
  yScale: Function;
  padding: number | { top: number, bottom: number };
  [propName: string]: any;
}

