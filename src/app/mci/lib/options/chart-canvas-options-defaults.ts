import { ChartCanvasOptions } from '../models/chart-canvas-options';
import * as d3 from 'd3';

export const chartCanvasOptionDefaults = {
  className: 'trading-chart',
  zIndex: 1,
  margin: { top: 20, right: 30, bottom: 30, left: 80 },
  xExtents: [d3.min, d3.max],
  xAccessor: d => d,
};
