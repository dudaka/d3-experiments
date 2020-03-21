import { ChartCanvasOptions, getCursorStyle } from './models/chart-canvas-options';
import { chartCanvasOptionDefaults } from './options/chart-canvas-options-defaults';

import * as d3 from 'd3';
import { functor, isDefined } from './utils';
import evaluator from './scale/evaluator';

export class ChartCanvas {

  private chartCanvasOptions: ChartCanvasOptions;
  chartCanvasSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  constructor(node: HTMLDivElement, options?: any) {
    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options
    };

    const { fullData, ...state } = this.resetChart(true);

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
    }


  }

  private resetChart(firstCalculation = false) {
    const state = this.calculateState();
    const { xAccessor, displayXAccessor, fullData } = state;
    const { plotData: initialPlotData, xScale } = state;
    // const { postCalculator, children } = props;
    const { postCalculator } = this.chartCanvasOptions;

    const plotData = postCalculator(initialPlotData);

    const dimensions = this.getDimensions();


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
