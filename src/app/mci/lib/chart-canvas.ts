import { ChartCanvasOptions, getCursorStyle } from './models/chart-canvas-options';
import { chartCanvasOptionDefaults } from './options/chart-canvas-options-defaults';

import * as d3 from 'd3';
import { functor, isDefined, isNotDefined, isObject, mapObject } from './utils';
import evaluator from './scale/evaluator';
import { Chart } from './chart';
import zipper from './utils/zipper';

import { flattenDeep } from 'lodash';

export class ChartCanvas {

  private chartCanvasOptions: ChartCanvasOptions;
  chartCanvasSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private charts: Chart[];
  private fullData: any[];
  private state: any;

  constructor(node: HTMLDivElement, charts: Chart[], options?: any) {
    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options
    };

    this.charts = charts;

    const { fullData, ...state } = this.resetChart(true);

    this.state = {
      ...state
    };

    this.fullData = fullData;

    this.render(node);

  }

  private render(node: HTMLDivElement) {
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

    this.addClipPathes();

    const g = this.chartCanvasSvg.append('g')
      .attr('transform', `translate(${margin.left + 0.5}, ${margin.top + 0.5})`);

    const eventCaptureOptions = {
      // useCrossHairStyleCursor={cursorStyle}
      // 				mouseMove={mouseMoveEvent && interaction}
      // 				zoom={zoomEvent && interaction}
      // 				pan={panEvent && interaction}
      // 				width={dimensions.width}
      // 				height={dimensions.height}
      // 				chartConfig={chartConfig}
      // 				xScale={xScale}
      // 				xAccessor={xAccessor}
      // 				focus={defaultFocus}
      // 				disableInteraction={this.props.disableInteraction}
      // 				getAllPanConditions={this.getAllPanConditions}
      // 				onContextMenu={this.handleContextMenu}
      // 				onClick={this.handleClick}
      // 				onDoubleClick={this.handleDoubleClick}
      // 				onMouseDown={this.handleMouseDown}
      // 				onMouseMove={this.handleMouseMove}
      // 				onMouseEnter={this.handleMouseEnter}
      // 				onMouseLeave={this.handleMouseLeave}
      // 				onDragStart={this.handleDragStart}
      // 				onDrag={this.handleDrag}
      // 				onDragComplete={this.handleDragEnd}
      // 				onZoom={this.handleZoom}
      // 				onPinchZoom={this.handlePinchZoom}
      // 				onPinchZoomEnd={this.handlePinchZoomEnd}
      // 				onPan={this.handlePan}
      // 				onPanEnd={this.handlePanEnd}
    };
  }

  private addClipPathes() {
    const defs = this.chartCanvasSvg.append('defs');

    const clipPath = defs.append('clipPath')
      .attr('id', 'chart-area-clip');

    const dimensions = this.getDimensions();

    clipPath.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const { chartConfig } = this.state;

    chartConfig.map(each => {
      const cp = defs.append('clipPath')
        .attr('id', `chart-area-clip-${each.id}`);

      cp.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', each.width)
        .attr('height', each.height);
    });
  }

  private resetChart(firstCalculation = false) {
    const state = this.calculateState();
    const { xAccessor, displayXAccessor, fullData } = state;
    const { plotData: initialPlotData, xScale } = state;
    // const { postCalculator, children } = props;
    const { postCalculator } = this.chartCanvasOptions;

    const plotData = postCalculator(initialPlotData);

    const chartConfig = this.getChartConfigWithUpdatedYScales(
      this.getNewChartConfig(),
      { plotData, xAccessor, displayXAccessor, fullData },
      xScale.domain()
    );

    return {
      ...state,
      xScale,
      plotData,
      chartConfig
    };

  }

  private getChartConfigWithUpdatedYScales(
    chartConfig,
    { plotData, xAccessor, displayXAccessor, fullData },
    xDomain,
    dy = null,
    chartsToPan = null
  ) {
    const yDomains = chartConfig
      .map(({ yExtentsCalculator, yExtents, yScale }) => {

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
          realYDomain: realYDomain,
        };
        // return { ...config, yScale: yScale.copy().domain(domain).range([height - padding, padding]) };
      });

    const updatedChartConfig = combine(chartConfig, yDomains);
    // console.error(yDomains, dy, chartsToPan, updatedChartConfig.map(d => d.yScale.domain()));
    // console.log(updatedChartConfig.map(d => ({ id: d.id, domain: d.yScale.domain() })))

    return updatedChartConfig;
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

  private yDomainFromYExtents(yExtents, yScale, plotData) {
    const yValues = yExtents.map(eachExtent =>
      plotData.map(this.values(eachExtent)));

    const allYValues = flattenDeep(yValues);
    // console.log(allYValues)
    const realYDomain = (yScale.invert)
      ? d3.extent(allYValues)
      : d3.set(allYValues).values();

    return realYDomain;
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

  private getNewChartConfig() {

    const dimensions = this.getDimensions();

    return this.charts.map(chart => chart.getChartConfig(dimensions));
  }

  private calculateState() {
    const {
      xAccessor: inputXAccesor,
      xExtents: xExtentsProp,
      data,
      padding,
      flipXScale
    } = this.chartCanvasOptions;

    const direction = this.getXScaleDirection(flipXScale);
    const dimensions = this.getDimensions();

    const extent = typeof xExtentsProp === 'function'
      ? xExtentsProp(data)
      : d3.extent(
        xExtentsProp
          .map(d => functor(d))
          .map(each => each(data, inputXAccesor))
      );

    const {
      xAccessor,
      displayXAccessor,
      xScale,
      fullData,
      filterData
    } = this.calculateFullData();

    const updatedXScale = this.setXRange(xScale, dimensions, padding, direction);

    const { plotData, domain } = filterData(
      fullData,
      extent,
      inputXAccesor,
      updatedXScale
    );

    if (plotData.length <= 1) {
      throw new Error(
        `Showing ${plotData.length} datapoints, review the 'xExtents' prop of ChartCanvas`
      );
    }

    return {
      plotData,
      xScale: updatedXScale.domain(domain),
      xAccessor,
      displayXAccessor,
      fullData,
      filterData
    };
  }

  private setXRange(xScale, dimensions, padding, direction = 1) {
    if (xScale.rangeRoundPoints) {
      if (isNaN(padding)) {
        throw new Error('padding has to be a number for ordinal scale');
      }
      xScale.rangeRoundPoints([0, dimensions.width], padding);
    } else if (xScale.padding) {
      if (isNaN(padding)) {
        throw new Error('padding has to be a number for ordinal scale');
      }
      xScale.range([0, dimensions.width]);
      xScale.padding(padding / 2);
    } else {
      const { left, right } = isNaN(padding)
        ? padding
        : { left: padding, right: padding };
      if (direction > 0) {
        xScale.range([left, dimensions.width - right]);
      } else {
        xScale.range([dimensions.width - right, left]);
      }
    }
    return xScale;
  }

  private calculateFullData() {
    const {
      data: fullData,
      plotFull,
      xScale,
      clamp,
      pointsPerPxThreshold,
      flipXScale
    } = this.chartCanvasOptions;

    const { xAccessor, displayXAccessor, minPointsPerPxThreshold } = this.chartCanvasOptions;

    const useWholeData = isDefined(plotFull)
      ? plotFull
      : xAccessor === (d => d);

    const { filterData } = evaluator({
      xScale,
      useWholeData,
      clamp,
      pointsPerPxThreshold,
      minPointsPerPxThreshold,
      flipXScale
    });

    return {
      xAccessor,
      displayXAccessor: displayXAccessor || xAccessor,
      xScale: xScale.copy(),
      fullData,
      filterData
    };
  }

  private getXScaleDirection(flipXScale: boolean) {
    return flipXScale ? -1 : 1;
  }

  private getDimensions() {
    const { height, width, margin } = this.chartCanvasOptions;

    return {
      height: height - margin.top - margin.bottom,
      width: width - margin.left - margin.right
    };
  }
}
