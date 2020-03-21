import { ChartCanvasOptions, getCursorStyle } from './models/chart-canvas-options';
import { chartCanvasOptionDefaults } from './options/chart-canvas-options-defaults';

import * as d3 from 'd3';

export class ChartCanvas {

  private chartCanvasOptions: ChartCanvasOptions;
  chartCanvasSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  constructor(node: HTMLDivElement, options?: any) {
    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options
    };

    console.log(node);
    console.log(this.chartCanvasOptions);

    const { className, width, height, zIndex, margin } = this.chartCanvasOptions;

    this.chartCanvasSvg = d3.select(node).append('svg')
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('z-index', zIndex + 5);

    this.chartCanvasSvg.append('style')
      .attr('type', 'text/css')
      .text(getCursorStyle(className));


    const defs = this.chartCanvasSvg.append('defs');

    const clipPath = defs.append('clipPath')
      .attr('id', 'chart-area-clip');

    const dimensions = this.getDimensions();

    clipPath.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = this.chartCanvasSvg.append('g')
      .attr('transform', `translate(${margin.left + 0.5}, ${margin.top + 0.5})`);

  }

  private getDimensions() {
    const { height, width, margin } = this.chartCanvasOptions;

    return {
      height: height - margin.top - margin.bottom,
      width: width - margin.left - margin.right
    };
  }
}
