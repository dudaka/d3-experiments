import { ChartCanvas } from './chart-canvas';
import { select as d3Select } from 'd3-selection';

export function createChartCanvas(domEl: HTMLDivElement, data: any[], options: any): ChartCanvas {
  const svg = d3Select(domEl).append('svg');
  return new ChartCanvas(svg, data, options);
}
