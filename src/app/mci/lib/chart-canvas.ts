import { ChartCanvasOptions } from './models/chart-canvas-options';
import { chartCanvasOptionDefaults } from './options/chart-canvas-options-defaults';

export class ChartCanvas {

  private chartCanvasOptions: ChartCanvasOptions;

  constructor(node: HTMLDivElement, options?: any) {
    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options
    };

    console.log(node);
    console.log(this.chartCanvasOptions);
  }
}
