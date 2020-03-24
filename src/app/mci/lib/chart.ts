import { ChartComponent } from './chart-component';
import { ChartOptions } from './models/chart-options';
import { chartOptionDefaults } from './options/chart-options-defaults';
import { isDefined } from '@angular/compiler/src/util';
import { functor, find } from './utils';
import shallowEqual from './utils/shallowEqual';

import * as d3 from 'd3';
import { CandlestickSeries } from './series/candlestick-series';
import { ChartCanvas } from './chart-canvas';

export class Chart {

  private chartOptions: ChartOptions;
  private chartComponents: ChartComponent[];

  constructor(chartComponents: ChartComponent[], options?: any) {

    this.chartOptions = {
      ...chartOptionDefaults,
      ...options
    };

    this.chartComponents = chartComponents;
  }

  public getChartConfig(innerDimension: { width: number, height: number }, existingChartConfig = []) {
    const {
      id,
      origin,
      padding,
      yExtents: yExtentsProp,
      yScale: yScaleProp,
      flipYScale,
      yExtentsCalculator
    } = this.chartOptions;

    const yScale = yScaleProp.copy();

    const {
      width, height, availableHeight
    } = this.getDimensions(innerDimension.width, innerDimension.height);

    const { yPan } = this.chartOptions;

    let { yPanEnabled } = this.chartOptions;

    const yExtents = isDefined(yExtentsProp)
      ? (Array.isArray(yExtentsProp) ? yExtentsProp : [yExtentsProp]).map(functor)
      : undefined;

    const prevChartConfig = find(existingChartConfig, d => d.id === id);

    if (this.isArraySize2AndNumber(yExtentsProp)) {
      if (
        isDefined(prevChartConfig)
        && prevChartConfig.yPan
        && prevChartConfig.yPanEnabled
        && yPan
        && yPanEnabled
        && shallowEqual(prevChartConfig.originalYExtentsProp, yExtentsProp)
      ) {
        // console.log(prevChartConfig.originalYExtentsProp, yExtentsProp)
        // console.log(prevChartConfig.yScale.domain())
        yScale.domain(prevChartConfig.yScale.domain());
      } else {
        const [a, b] = yExtentsProp as any[];
        yScale.domain([a, b]);
      }
    } else if (isDefined(prevChartConfig) && prevChartConfig.yPanEnabled) {
      if (this.isArraySize2AndNumber(prevChartConfig.originalYExtentsProp)) {
        // do nothing
      } else {
        yScale.domain(prevChartConfig.yScale.domain());
        yPanEnabled = true;
      }
    }

    return {
      id,
      origin: functor(origin)(width, availableHeight),
      padding,
      originalYExtentsProp: yExtentsProp,
      yExtents,
      yExtentsCalculator,
      flipYScale,
      // yScale: setRange(yScale.copy(), height, padding, flipYScale),
      yScale,
      yPan,
      yPanEnabled,
      // mouseCoordinates,
      width,
      height
    };
  }

  private isArraySize2AndNumber(yExtentsProp) {
    if (Array.isArray(yExtentsProp) && yExtentsProp.length === 2) {
      const [a, b] = yExtentsProp;
      return (typeof a === 'number' && typeof b === 'number');
    }
    return false;
  }

  private getDimensions(width: number, height: number) {

    const chartHeight = (this.chartOptions.height || height);

    return {
      availableHeight: height,
      width,
      height: chartHeight
    };
  }

  render(chartsG: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const { origin } = this.chartOptions;
    const [x, y] = origin as any[];

    const chartComponentsG = chartsG.append('g')
      .attr('transform', `translate(${ x }, ${ y })`);

    // console.log(this.chartComponents);
    this.chartComponents.map(component => {
      // console.log(typeof component);
      if (component instanceof CandlestickSeries) {
        component.render(chartComponentsG);
      }
    });
  }
}
