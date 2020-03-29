import { Aggregator } from './aggregator';
import { ChartConfigIterator } from './chart-config-iterator';
import { ChartConfig } from './chart-config';
import { MyIterator } from '../common/my-iterator';
import { chartOptionDefaults } from '../../options/chart-options-defaults';
import { isDefined, isNotDefined, isObject, mapObject, head, getClosestItem } from '../../utils';
import zipper from '../../utils/zipper';
import { flattenDeep } from 'lodash';
import { functor, find } from '../../utils';
import shallowEqual from '../../utils/shallowEqual';

import { extent as d3Extent } from 'd3-array';
import { set as d3Set } from 'd3-collection';

export class ChartConfigCollection implements Aggregator {

  private charts: ChartConfig[] = [];

  public getItems(): ChartConfig[] {
    return this.charts;
  }

  public getCount(): number {
    return this.charts.length;
  }

  public addItem(chartOptions: any): void {
    const chartConfig = {
      ...chartOptionDefaults,
      ...chartOptions
    };
    this.charts.push(chartConfig);
  }

  public getIterator(): MyIterator<ChartConfig> {
    return new ChartConfigIterator(this);
  }

  public getReverseIterator(): MyIterator<ChartConfig> {
    return new ChartConfigIterator(this, true);
  }

  getNewChartConfig(dimensions) {
    return this.charts.map(chart => this.getChartConfig(chart, dimensions));
  }

  private getChartConfig(chart,
    innerDimension: { width: number, height: number },
    existingChartConfig = []) {
    const {
      id,
      origin,
      padding,
      yExtents: yExtentsProp,
      yScale: yScaleProp,
      flipYScale,
      yExtentsCalculator
    } = chart;

    const yScale = yScaleProp.copy();

    const {
      width, height, availableHeight
    } = this.getDimensions(chart, innerDimension.width, innerDimension.height);

    const { yPan } = chart;

    let { yPanEnabled } = chart;

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

  private getDimensions(chart: ChartConfig, width: number, height: number) {

    const chartHeight = (chart.height || height);

    return {
      availableHeight: height,
      width,
      height: chartHeight
    };
  }

  getChartConfigWithUpdatedYScales(
    dimensions,
    { plotData, xAccessor, displayXAccessor, fullData },
    xDomain,
    dy = null,
    chartsToPan = null
  ) {
    const chartConfig = this.getNewChartConfig(dimensions);
    const yDomains = chartConfig.map(({ yExtentsCalculator, yExtents, yScale }) => {

      const realYDomain = isDefined(yExtentsCalculator)
        ? yExtentsCalculator({ plotData, xDomain, xAccessor, displayXAccessor, fullData })
        : this.yDomainFromYExtents(yExtents, yScale, plotData);

      // console.log("yScale.domain() ->", yScale.domain())

      const yDomainDY = isDefined(dy)
        ? yScale.range().map(each => each - dy).map(yScale.invert)
        : yScale.domain();

      return {
        realYDomain,
        yDomainDY,
        prevYDomain: yScale.domain(),
      };
    });

    const combine = zipper()
      .combine((config, { realYDomain, yDomainDY, prevYDomain }) => {
        const { id, padding, height, yScale, yPan, flipYScale, yPanEnabled = false } = config;

        const another = isDefined(chartsToPan)
          ? chartsToPan.indexOf(id) > -1
          : true;
        const domain = yPan && yPanEnabled
          ? another ? yDomainDY : prevYDomain
          : realYDomain;

        // console.log(id, yPan, yPanEnabled, another);
        // console.log(domain, realYDomain, prevYDomain);
        const newYScale = this.setRange(
          yScale.copy().domain(domain), height, padding, flipYScale
        );
        return {
          ...config,
          yScale: newYScale,
          realYDomain,
        };
        // return { ...config, yScale: yScale.copy().domain(domain).range([height - padding, padding]) };
      });

    const updatedChartConfig = combine(chartConfig, yDomains);
    // console.error(yDomains, dy, chartsToPan, updatedChartConfig.map(d => d.yScale.domain()));
    // console.log(updatedChartConfig.map(d => ({ id: d.id, domain: d.yScale.domain() })))

    return updatedChartConfig;
  }

  private yDomainFromYExtents(yExtents, yScale, plotData) {
    const yValues = yExtents.map(eachExtent =>
      plotData.map(this.values(eachExtent)));

    const allYValues = flattenDeep(yValues);
    // console.log(allYValues)
    const realYDomain = (yScale.invert)
      ? d3Extent(allYValues)
      : d3Set(allYValues).values();

    return realYDomain;
  }

  private setRange(scale, height, padding, flipYScale) {
    if (scale.rangeRoundPoints || isNotDefined(scale.invert)) {
      if (isNaN(padding)) {
        throw new Error('padding has to be a number for ordinal scale');
      }
      if (scale.rangeRoundPoints) { scale.rangeRoundPoints(flipYScale ? [0, height] : [height, 0], padding); }
      if (scale.rangeRound) { scale.range(flipYScale ? [0, height] : [height, 0]).padding(padding); }
    } else {
      const { top, bottom } = isNaN(padding)
        ? padding
        : { top: padding, bottom: padding };

      scale.range(flipYScale ? [top, height - bottom] : [height - bottom, top]);
    }
    return scale;
  }

  private values(func) {
    return (d) => {
      const obj = func(d);
      if (isObject(obj)) {
        return mapObject(obj);
      }
      return obj;
    };
  }

}
