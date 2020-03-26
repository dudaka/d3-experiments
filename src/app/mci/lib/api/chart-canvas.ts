import { chartCanvasOptionDefaults, getCursorStyle } from '../options/chart-canvas-options-defaults';

import { functor, isDefined } from '../utils';
import evaluator from '../scale/evaluator';
import { Chart } from './chart';

import { Selection } from 'd3-selection';
import { extent as d3Extent } from 'd3-array';
import { ChartConfigCollection } from '../models/chart-config/chart-config-collection';

export class ChartCanvas {
  // private static instance: ChartCanvas;

  private chartCanvasOptions: any;
  // private charts: Chart[];
  // private chartConfigs: ChartConfigCollection;
  private fullData: any[];
  private state: any;
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private defs: Selection<SVGDefsElement, unknown, null, undefined>;
  private chartsSvg: Selection<SVGGElement, unknown, null, undefined>;

  constructor(svg: Selection<SVGSVGElement, unknown, null, undefined>,
    data: any[], options?: any) {

    this.svg = svg;

    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options,
      ...data
    };

    // this.charts = [];
    const { fullData, ...state } = this.resetChart(true);

    this.setState(state);

    this.fullData = fullData;

    this.render();

  }

  // Add chart
  addChart(chartOptions: any) {

    let { chartConfigs } = this.state;
    chartConfigs = chartConfigs ? chartConfigs : new ChartConfigCollection();
    chartConfigs.addItem(chartOptions);

    const dimensions = this.getDimensions();

    const {
      xAccessor,
      displayXAccessor,
      fullData,
      plotData,
      xScale
    } = this.state;

    this.setState({
      chartConfigs: chartConfigs.getChartConfigWithUpdatedYScales(
        dimensions,
        { plotData, xAccessor, displayXAccessor, fullData },
        xScale.domain())
    });

    this.addChartClipPaths();

    const context = {};
    return new Chart(context, chartOptions);
  }

  private addChartClipPaths() {
    const { chartConfigs } = this.state;

    chartConfigs.map(each => {
      const cp = this.defs.select(`#chart-area-clip-${each.id}`);
      if (cp.empty()) {
        this.defs.append('clipPath')
            .attr('id', `chart-area-clip-${each.id}`)
          .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', each.width)
            .attr('height', each.height);
      }
    });
  }

  private setState(obj: any) {
    this.state = {
      ...this.state,
      ...obj
    };
  }

  private render() {

    const { className, width, height, zIndex, margin } = this.chartCanvasOptions;
    this.svg.append('svg')
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('z-index', zIndex + 5);
    this.svg.append('style')
      .attr('type', 'text/css')
      .text(getCursorStyle(className));
    this.addDefaultClipPath();
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left + 0.5}, ${margin.top + 0.5})`);

    this.chartsSvg = g.append('g').attr('class', `${className}-avoid-interaction`);
  }


  private addDefaultClipPath() {
    this.defs = this.svg.append('defs');

    const clipPath = this.defs.append('clipPath')
      .attr('id', 'chart-area-clip');

    const dimensions = this.getDimensions();

    clipPath.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
  }

  private resetChart(firstCalculation = false) {
    const state = this.calculateState();
    // const { xAccessor, displayXAccessor, fullData } = state;
    const { plotData: initialPlotData, xScale } = state;
    // const { postCalculator, children } = props;
    const { postCalculator } = this.chartCanvasOptions;

    const plotData = postCalculator(initialPlotData);

    // const chartConfig = this.getChartConfigWithUpdatedYScales(
    //   this.getNewChartConfig(),
    //   { plotData, xAccessor, displayXAccessor, fullData },
    //   xScale.domain()
    // );

    return {
      ...state,
      xScale,
      plotData,
      // chartConfig
    };

  }

  private calculateState() {
    const {
      xAccessor: inputXAccesor,
      xExtents: xExtentsProp,
      padding,
      flipXScale,
      data
    } = this.chartCanvasOptions;

    const direction = this.getXScaleDirection(flipXScale);
    const dimensions = this.getDimensions();

    const extent = typeof xExtentsProp === 'function'
      ? xExtentsProp(data)
      : d3Extent(
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
