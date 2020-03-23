import { ChartCanvasOptions, getCursorStyle } from './models/chart-canvas-options';
import { chartCanvasOptionDefaults } from './options/chart-canvas-options-defaults';

import * as d3 from 'd3';
import { functor, isDefined, isNotDefined, isObject, mapObject, head, getClosestItem } from './utils';
import evaluator from './scale/evaluator';
import { Chart } from './chart';
import zipper from './utils/zipper';

import { flattenDeep } from 'lodash';
import { Autobind } from './utils/autobind';
import { EventCapture } from './event-capture';

export class ChartCanvas {

  private chartCanvasOptions: ChartCanvasOptions;
  chartCanvasSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private charts: Chart[];
  private fullData: any[];
  private state: any;
  private subscriptions = [];
  private mutableState: any;

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

    this.mutableState = {};

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

    this.addEventCapture(g);

    this.addCharts(g);
  }


  private addCharts(g: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const { className } = this.chartCanvasOptions;

    const chartsG = g.append('g').attr('class', `${className}-avoid-interaction`);

    this.charts.map(chart => {
      chart.render(chartsG);
    });
  }

  private addEventCapture(selection: d3.Selection<SVGGElement, unknown, null, undefined>) {

    const {
      useCrossHairStyleCursor,
      mouseMoveEvent,
      zoomEvent,
      panEvent,
      defaultFocus,
      disableInteraction
    } = this.chartCanvasOptions;

    const { plotData, xScale, xAccessor, chartConfig } = this.state;

    const interaction = this.isInteractionEnabled(xScale, xAccessor, plotData);

    const cursorStyle = useCrossHairStyleCursor && interaction;

    const dimensions = this.getDimensions();

    const eventCaptureParams = {
      useCrossHairStyleCursor: cursorStyle,
      mouseMove: mouseMoveEvent && interaction,
      zoom: zoomEvent && interaction,
      pan: panEvent && interaction,
      width: dimensions.width,
      height: dimensions.height,
      chartConfig,
      xScale,
      xAccessor,
      focus: defaultFocus,
      disableInteraction,
      getAllPanConditions: this.getAllPanConditions,
      onContextMenu: this.handleContextMenu,
      onClick: this.handleClick,
      onDoubleClick: this.handleDoubleClick,
      onMouseDown: this.handleMouseDown,
      onMouseMove: this.handleMouseMove,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onDragStart: this.handleDragStart,
      onDrag: this.handleDrag,
      onDragComplete: this.handleDragEnd,
      onZoom: this.handleZoom,
      onPinchZoom: this.handlePinchZoom,
      onPinchZoomEnd: this.handlePinchZoomEnd,
      onPan: this.handlePan,
      onPanEnd: this.handlePanEnd,
    };

    const eventCapture = new EventCapture(selection, eventCaptureParams);
  }

  @Autobind
  private handlePan(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
    // console.log("[ChartCanvas] handlePan");
    // if (!this.waitingForPanAnimationFrame) {
    //   this.waitingForPanAnimationFrame = true;

    //   this.hackyWayToStopPanBeyondBounds__plotData =
    //     this.hackyWayToStopPanBeyondBounds__plotData ||
    //     this.state.plotData;
    //   this.hackyWayToStopPanBeyondBounds__domain =
    //     this.hackyWayToStopPanBeyondBounds__domain ||
    //     this.state.xScale.domain();

    //   const state = this.panHelper(
    //     mousePosition,
    //     panStartXScale,
    //     dxdy,
    //     chartsToPan
    //   );

    //   this.hackyWayToStopPanBeyondBounds__plotData = state.plotData;
    //   this.hackyWayToStopPanBeyondBounds__domain = state.xScale.domain();

    //   this.panInProgress = true;
    //   // console.log(panStartXScale.domain(), state.xScale.domain());

    //   this.triggerEvent("pan", state, e);

    //   this.mutableState = {
    //     mouseXY: state.mouseXY,
    //     currentItem: state.currentItem,
    //     currentCharts: state.currentCharts
    //   };
    //   requestAnimationFrame(() => {
    //     this.waitingForPanAnimationFrame = false;
    //     this.clearBothCanvas();
    //     this.draw({ trigger: "pan" });
    //   });
    // }
  }

  private handlePanEnd(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
    // console.log("[ChartCanvas] handlePanEnd");
    // const state = this.panHelper(
    //   mousePosition,
    //   panStartXScale,
    //   dxdy,
    //   chartsToPan
    // );
    // // console.log(this.canvasDrawCallbackList.map(d => d.type));
    // this.hackyWayToStopPanBeyondBounds__plotData = null;
    // this.hackyWayToStopPanBeyondBounds__domain = null;

    // this.panInProgress = false;

    // // console.log("PANEND", panEnd++);
    // const { xScale, plotData, chartConfig } = state;

    // this.triggerEvent("panend", state, e);

    // requestAnimationFrame(() => {
    //   const { xAccessor } = this.state;
    //   const { fullData } = this;

    //   const firstItem = head(fullData);
    //   const start = head(xScale.domain());
    //   const end = xAccessor(firstItem);
    //   // console.log(start, end, start < end ? "Load more" : "I have it");

    //   const { onLoadMore } = this.props;

    //   this.clearThreeCanvas();

    //   this.setState(
    //     {
    //       xScale,
    //       plotData,
    //       chartConfig
    //     },
    //     () => {
    //       if (start < end) onLoadMore(start, end);
    //     }
    //   );
    // });
  }

  @Autobind
  private handlePinchZoom(initialPinch, finalPinch, e) {
    // console.log("[ChartCanvas] handlePinchZoom");
    // if (!this.waitingForPinchZoomAnimationFrame) {
    //   this.waitingForPinchZoomAnimationFrame = true;
    //   const state = this.pinchZoomHelper(initialPinch, finalPinch);

    //   this.triggerEvent("pinchzoom", state, e);

    //   this.finalPinch = finalPinch;

    //   requestAnimationFrame(() => {
    //     this.clearBothCanvas();
    //     this.draw({ trigger: "pinchzoom" });
    //     this.waitingForPinchZoomAnimationFrame = false;
    //   });
    // }
  }

  private handlePinchZoomEnd(initialPinch, e) {
    // console.log("[ChartCanvas] handlePinchZoomEnd");
    // const { xAccessor } = this.state;

    // if (this.finalPinch) {
    //   const state = this.pinchZoomHelper(initialPinch, this.finalPinch);
    //   const { xScale } = state;
    //   this.triggerEvent("pinchzoom", state, e);

    //   this.finalPinch = null;

    //   this.clearThreeCanvas();

    //   const { fullData } = this;
    //   const firstItem = head(fullData);

    //   const start = head(xScale.domain());
    //   const end = xAccessor(firstItem);
    //   const { onLoadMore } = this.props;

    //   this.setState(state, () => {
    //     if (start < end) {
    //       onLoadMore(start, end);
    //     }
    //   });
    // }
  }

  @Autobind
  private handleZoom(zoomDirection, mouseXY, e) {
    // console.log("[ChartCanvas] handleZoom");
    // if (this.panInProgress) return;
    // // console.log("zoomDirection ", zoomDirection, " mouseXY ", mouseXY);
    // const {
    //   xAccessor,
    //   xScale: initialXScale,
    //   plotData: initialPlotData
    // } = this.state;
    // const { zoomMultiplier, zoomAnchor } = this.props;
    // const { fullData } = this;
    // const item = zoomAnchor({
    //   xScale: initialXScale,
    //   xAccessor,
    //   mouseXY,
    //   plotData: initialPlotData,
    //   fullData
    // });

    // const cx = initialXScale(item);
    // const c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
    // const newDomain = initialXScale
    //   .range()
    //   .map(x => cx + (x - cx) * c)
    //   .map(initialXScale.invert);

    // const { xScale, plotData, chartConfig } = this.calculateStateForDomain(
    //   newDomain
    // );

    // const currentItem = getCurrentItem(
    //   xScale,
    //   xAccessor,
    //   mouseXY,
    //   plotData
    // );
    // const currentCharts = getCurrentCharts(chartConfig, mouseXY);

    // this.clearThreeCanvas();

    // const firstItem = head(fullData);

    // const start = head(xScale.domain());
    // const end = xAccessor(firstItem);
    // const { onLoadMore } = this.props;

    // this.mutableState = {
    //   mouseXY: mouseXY,
    //   currentItem: currentItem,
    //   currentCharts: currentCharts
    // };

    // this.triggerEvent(
    //   "zoom",
    //   {
    //     xScale,
    //     plotData,
    //     chartConfig,
    //     mouseXY,
    //     currentCharts,
    //     currentItem,
    //     show: true
    //   },
    //   e
    // );

    // this.setState(
    //   {
    //     xScale,
    //     plotData,
    //     chartConfig
    //   },
    //   () => {
    //     if (start < end) {
    //       onLoadMore(start, end);
    //     }
    //   }
    // );
  }

  @Autobind
  private handleMouseDown(mousePosition, currentCharts, e) {
    // console.log("[ChartCanvas] handleMouseDown");
    // this.triggerEvent('mousedown', this.mutableState, e);
  }

  @Autobind
  private handleMouseEnter(e) {
    // console.log("[ChartCanvas] handleMouseEnter");
    // this.triggerEvent(
    //   'mouseenter',
    //   {
    //     show: true
    //   },
    //   e
    // );
  }

  @Autobind
  private handleMouseMove(mouseXY, inputType, e) {
    // console.log("[ChartCanvas] handleMouseMove");
    // if (!this.waitingForMouseMoveAnimationFrame) {
    //   this.waitingForMouseMoveAnimationFrame = true;

    //   const { chartConfig, plotData, xScale, xAccessor } = this.state;
    //   const currentCharts = getCurrentCharts(chartConfig, mouseXY);
    //   const currentItem = getCurrentItem(
    //     xScale,
    //     xAccessor,
    //     mouseXY,
    //     plotData
    //   );
    //   this.triggerEvent(
    //     "mousemove",
    //     {
    //       show: true,
    //       mouseXY,
    //       // prevMouseXY is used in interactive components
    //       prevMouseXY: this.prevMouseXY,
    //       currentItem,
    //       currentCharts
    //     },
    //     e
    //   );

    //   this.prevMouseXY = mouseXY;
    //   this.mutableState = {
    //     mouseXY,
    //     currentItem,
    //     currentCharts
    //   };

    //   requestAnimationFrame(() => {
    //     this.clearMouseCanvas();
    //     this.draw({ trigger: "mousemove" });
    //     this.waitingForMouseMoveAnimationFrame = false;
    //   });
    // }
  }

  @Autobind
  private handleMouseLeave(e) {
    // console.log("[ChartCanvas] handleMouseLeave");
    // this.triggerEvent("mouseleave", { show: false }, e);
    // this.clearMouseCanvas();
    // this.draw({ trigger: "mouseleave" });
  }

  @Autobind
  private handleDragStart({ startPos }, e) {
    // console.log("[ChartCanvas] handleDragStart");
    // this.triggerEvent("dragstart", { startPos }, e);
  }

  @Autobind
  private handleDrag({ startPos, mouseXY }, e) {
    // console.log("[ChartCanvas] handleDrag");
    // const { chartConfig, plotData, xScale, xAccessor } = this.state;
    // const currentCharts = getCurrentCharts(chartConfig, mouseXY);
    // const currentItem = getCurrentItem(
    //   xScale,
    //   xAccessor,
    //   mouseXY,
    //   plotData
    // );

    // this.triggerEvent(
    //   "drag",
    //   {
    //     startPos,
    //     mouseXY,
    //     currentItem,
    //     currentCharts
    //   },
    //   e
    // );

    // this.mutableState = {
    //   mouseXY,
    //   currentItem,
    //   currentCharts
    // };

    // requestAnimationFrame(() => {
    //   this.clearMouseCanvas();
    //   this.draw({ trigger: "drag" });
    // });
  }

  @Autobind
  private handleDragEnd({ mouseXY }, e) {
    // console.log("[ChartCanvas] handleDragEnd");
    // this.triggerEvent("dragend", { mouseXY }, e);

    // requestAnimationFrame(() => {
    //   this.clearMouseCanvas();
    //   this.draw({ trigger: "dragend" });
    // });
  }

  @Autobind
  private handleClick(mousePosition, e) {
    // console.log("handleClick");
    // this.triggerEvent('click', this.mutableState, e);

    // requestAnimationFrame(() => {
    //   this.clearMouseCanvas();
    //   this.draw({ trigger: 'click' });
    // });
  }

  private draw(props) {
    // console.log("[ChartCanvas] draw");
    // this.subscriptions.forEach(each => {
    //   if (isDefined(each.draw)) each.draw(props);
    // });
  }

  private clearMouseCanvas() {
    // console.log("[ChartCanvas] clearMouseCanvas");
    // const canvases = this.getCanvasContexts();
    // if (canvases && canvases.mouseCoord) {
    //   clearCanvas(
    //     [
    //       canvases.mouseCoord
    //       // canvases.hover,
    //     ],
    //     this.props.ratio
    //   );
    // }
  }

  private getCanvasContexts() {
    // console.log("[ChartCanvas] getCanvasContexts");
    // if (this.canvasContainerNode) {
    //   return this.canvasContainerNode.getCanvasContexts();
    // }
  }

  @Autobind
  private handleDoubleClick(mousePosition, e) {
    // console.log("[ChartCanvas] handleDoubleClick");
    // this.triggerEvent('dblclick', {}, e);
  }

  @Autobind
  private handleContextMenu(mouseXY, e) {
    // console.log("[ChartCanvas] handleContextMenu");
    // const { xAccessor, chartConfig, plotData, xScale } = this.state;

    // const currentCharts = this.getCurrentCharts(chartConfig, mouseXY);
    // const currentItem = this.getCurrentItem(xScale, xAccessor, mouseXY, plotData);

    // this.triggerEvent(
    //   'contextmenu',
    //   {
    //     mouseXY,
    //     currentItem,
    //     currentCharts
    //   },
    //   e
    // );
  }

  private triggerEvent(type, props, e) {
    // console.log("[ChartCanvas] triggerEvent");
    // console.log("triggering ->", type);

    this.subscriptions.forEach(each => {
      const state = {
        ...this.state,
        fullData: this.fullData,
        subscriptions: this.subscriptions
      };
      each.listener(type, props, state, e);
    });
  }

  private getCurrentItem(xScale, xAccessor, mouseXY, plotData) {
    let xValue;
    let item;
    if (xScale.invert) {
      xValue = xScale.invert(mouseXY[0]);
      item = getClosestItem(plotData, xValue, xAccessor);
    } else {
      const d = xScale.range().map((d, idx) => ({ x: Math.abs(d - mouseXY[0]), idx })).reduce((a, b) => a.x < b.x ? a : b);
      item = isDefined(d) ? plotData[d.idx] : plotData[0];
      // console.log(d, item);
    }
    return item;
  }

  private getCurrentCharts(chartConfig, mouseXY) {
    const currentCharts = chartConfig.filter(eachConfig => {
      const top = eachConfig.origin[1];
      const bottom = top + eachConfig.height;
      return (mouseXY[1] > top && mouseXY[1] < bottom);
    }).map(config => config.id);

    return currentCharts;
  }

  @Autobind
  private getAllPanConditions() {
    // console.log("[ChartCanvas] getAllPanConditions");
    return this.subscriptions.map(each => each.getPanConditions());
  }


  private isInteractionEnabled(xScale, xAccessor, data) {
    const interaction =
      !isNaN(xScale(xAccessor(head(data)))) && isDefined(xScale.invert);
    return interaction;
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
