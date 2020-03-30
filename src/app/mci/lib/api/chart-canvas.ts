import { chartCanvasOptionDefaults, getCursorStyle } from '../options/chart-canvas-options-defaults';

import { functor, isDefined, head } from '../utils';
import evaluator from '../scale/evaluator';
import { Chart } from './chart';

import { Selection } from 'd3-selection';
import { extent as d3Extent } from 'd3-array';
import { ChartConfigCollection } from '../models/chart-config/chart-config-collection';
import { Autobind } from '../utils/autobind';
import { EventCapture } from './event-capture';
import { getCurrentCharts, getCurrentItem } from '../utils/chartUtils';

export class ChartCanvas {
  // private static instance: ChartCanvas;

  private chartCanvasOptions: any;
  // private charts: Chart[];
  private chartConfigsCollection: ChartConfigCollection;
  private fullData: any[];
  private state: any;
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private defs: Selection<SVGDefsElement, unknown, null, undefined>;
  private chartsSvg: Selection<SVGGElement, unknown, null, undefined>;
  private waitingForMouseMoveAnimationFrame: boolean;
  private prevMouseXY: any[];
  private mutableState: any;
  private subscriptions: any[];
  private lastSubscriptionId: number;

  constructor(svg: Selection<SVGSVGElement, unknown, null, undefined>,
    data: any[], options?: any) {

    this.svg = svg;

    this.chartCanvasOptions = {
      ...chartCanvasOptionDefaults,
      ...options,
      ...data
    };

    this.mutableState = {};
    this.subscriptions = [];
    this.lastSubscriptionId = 0;

    // this.charts = [];
    const { fullData, ...state } = this.resetChart(true);

    this.setState(state);

    this.chartConfigsCollection = new ChartConfigCollection();

    this.fullData = fullData;

    this.render();

  }

  // Add chart
  addChart(chartOptions?: any) {

    // let { chartConfigs } = this.state;
    // chartConfigs = chartConfigs ? chartConfigs : new ChartConfigCollection();
    this.chartConfigsCollection.addItem(chartOptions);

    const dimensions = this.getDimensions();

    const {
      xAccessor,
      displayXAccessor,
      fullData,
      plotData,
      xScale
    } = this.state;

    this.setState({
      chartConfigs: this.chartConfigsCollection.getChartConfigWithUpdatedYScales(
        dimensions,
        { plotData, xAccessor, displayXAccessor, fullData },
        xScale.domain())
    });

    this.addChartClipPaths();

    const context = this.getContext();

    return new Chart(this.chartsSvg, context, chartOptions);
  }

  private getContext() {
    const dimensions = this.getDimensions();
    return {
      fullData: this.fullData,
      plotData: this.state.plotData,
      width: dimensions.width,
      height: dimensions.height,
      chartConfigs: this.state.chartConfigs,
      xScale: this.state.xScale,
      xAccessor: this.state.xAccessor,
      displayXAccessor: this.state.displayXAccessor,
      // chartCanvasType: this.props.type,
      margin: this.chartCanvasOptions.margin,
      // ratio: this.props.ratio,
      // xAxisZoom: this.xAxisZoom,
      // yAxisZoom: this.yAxisZoom,
      // getCanvasContexts: this.getCanvasContexts,
      // redraw: this.redraw,
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
      generateSubscriptionId: this.generateSubscriptionId,
      getMutableState: this.getMutableState,
      // amIOnTop: this.amIOnTop,
      // setCursorClass: this.setCursorClass
    };
  }

  @Autobind
  private generateSubscriptionId() {
    console.log('[ChartCanvas] generateSubscriptionId');
    this.lastSubscriptionId++;
    return this.lastSubscriptionId;
  }

  @Autobind
  private getMutableState() {
    console.log('[ChartCanvas] getMutableState');
    return this.mutableState;
  }

  @Autobind
  private subscribe(id, rest) {
    console.log(`[ChartCanvas] subscribe, id = ${id}`, rest);
    const {
      getPanConditions = functor({
        draggable: false,
        panEnabled: true
      })
    } = rest;

    this.subscriptions = this.subscriptions.concat({
      id,
      ...rest,
      getPanConditions
    });

    console.log(this.subscriptions);
  }

  @Autobind
  private unsubscribe(id) {
    console.log('[ChartCanvas] unsubscribe');
    this.subscriptions = this.subscriptions.filter(each => each.id !== id);
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
    this.svg
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      // .style('position', 'absolute')
      .style('z-index', zIndex + 5);
    this.svg.append('style')
      .attr('type', 'text/css')
      .text(getCursorStyle(className));
    this.addDefaultClipPath();
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left + 0.5}, ${margin.top + 0.5})`);

    this.addEventCapture(g);

    this.chartsSvg = g.append('g').attr('class', `${className}-avoid-interaction`);
  }

  @Autobind
  private getChartConfigs() {
    const { chartConfigs } = this.state;
    return chartConfigs;
  }

  private addEventCapture(g: Selection<SVGGElement, unknown, null, undefined>) {

    const {
      useCrossHairStyleCursor,
      defaultFocus,
      mouseMoveEvent,
      panEvent,
      zoomEvent
    } = this.chartCanvasOptions;
    const { plotData, xScale, xAccessor } = this.state;
    const interaction = this.isInteractionEnabled(xScale, xAccessor, plotData);
    const cursorStyle = useCrossHairStyleCursor && interaction;
    const dimensions = this.getDimensions();

    const eventCaptureOptions = {
      useCrossHairStyleCursor: cursorStyle,
      mouseMove: mouseMoveEvent && interaction,
      zoom: zoomEvent && interaction,
      pan: panEvent && interaction,
      width: dimensions.width,
      height: dimensions.height,
      chartConfigs: this.getChartConfigs,
      xScale,
      xAccessor,
      focus: defaultFocus,
      disableInteraction: this.chartCanvasOptions.disableInteraction,
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
      onPanEnd: this.handlePanEnd
    };

    return new EventCapture(g, eventCaptureOptions);
  }

  @Autobind
  private handlePinchZoom(initialPinch, finalPinch, e) {
    console.log('[ChartCanvas] handlePinchZoom');
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

  @Autobind
  private handlePan(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
    console.log('[ChartCanvas] handlePan');
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

  @Autobind
  private handlePanEnd(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
    console.log('[ChartCanvas] handlePanEnd');
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
  private handleZoom(zoomDirection, mouseXY, e) {
    console.log('[ChartCanvas] handleZoom');
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
  private handleDrag({ startPos, mouseXY }, e) {
    console.log('[ChartCanvas] handleDrag');
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
    console.log('[ChartCanvas] handleDragEnd');
    // this.triggerEvent("dragend", { mouseXY }, e);

    // requestAnimationFrame(() => {
    //   this.clearMouseCanvas();
    //   this.draw({ trigger: "dragend" });
    // });
  }

  @Autobind
  private handleDragStart({ startPos }, e) {
    console.log('[ChartCanvas] handleDragStart');
    // this.triggerEvent("dragstart", { startPos }, e);
  }

  @Autobind
  handleMouseMove(mouseXY, inputType, e) {
    console.log('[ChartCanvas] handleMouseMove');
    if (!this.waitingForMouseMoveAnimationFrame) {
      this.waitingForMouseMoveAnimationFrame = true;

      const { chartConfigs, plotData, xScale, xAccessor } = this.state;

      const currentCharts = getCurrentCharts(chartConfigs, mouseXY);
      const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
      this.triggerEvent('mousemove', {
        show: true,
        mouseXY,
        // prevMouseXY is used in interactive components
        prevMouseXY: this.prevMouseXY,
        currentItem,
        currentCharts
      }, e);

      this.prevMouseXY = mouseXY;
      this.mutableState = {
        mouseXY,
        currentItem,
        currentCharts
      };

      requestAnimationFrame(() => {
        this.clearMouseCanvas();
        this.draw({ trigger: 'mousemove' });
        this.waitingForMouseMoveAnimationFrame = false;
      });
    }
  }

  private draw(props) {
    console.log('[ChartCanvas] draw');
    this.subscriptions.forEach(each => {
      if (isDefined(each.draw)) {
        each.draw(props);
      }
    });
  }

  private clearMouseCanvas() {
    console.log('[ChartCanvas] clearMouseCanvas');
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

  @Autobind
  private handleDoubleClick(mousePosition, e) {
    console.log('[ChartCanvas] handleDoubleClick');
    // this.triggerEvent("dblclick", {}, e);
  }

  @Autobind
  private handleContextMenu(mouseXY, e) {
    console.log('[ChartCanvas] handleContextMenu');
    // const { xAccessor, chartConfig, plotData, xScale } = this.state;

    // const currentCharts = getCurrentCharts(chartConfig, mouseXY);
    // const currentItem = getCurrentItem(
    //   xScale,
    //   xAccessor,
    //   mouseXY,
    //   plotData
    // );

    // this.triggerEvent(
    //   "contextmenu",
    //   {
    //     mouseXY,
    //     currentItem,
    //     currentCharts
    //   },
    //   e
    // );
  }

  @Autobind
  handleMouseDown(mousePosition, currentCharts, e) {
    console.log('[ChartCanvas] handleMouseDown');
    // this.triggerEvent("mousedown", this.mutableState, e);
  }

  @Autobind
  private handleClick(mousePosition, e) {
    console.log('[ChartCanvas] handleClick');
    // this.triggerEvent("click", this.mutableState, e);

    // requestAnimationFrame(() => {
    //   this.clearMouseCanvas();
    //   this.draw({ trigger: "click" });
    // });
  }

  @Autobind
  private handlePinchZoomEnd(initialPinch, e) {
    console.log('[ChartCanvas] handlePinchZoomEnd');
    const { xAccessor } = this.state;

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
  handleMouseLeave(e) {
    console.log('[ChartCanvas] handleMouseLeave');
    this.triggerEvent('mouseleave', { show: false }, e);
    // this.clearMouseCanvas();
    // this.draw({ trigger: "mouseleave" });
  }

  @Autobind
  private handleMouseEnter(e) {
    console.log('[ChartCanvas] handleMouseEnter');
    this.triggerEvent('mouseenter',
      {
        show: true
      },
      e
    );
  }

  private triggerEvent(type, props, e) {
    console.log('[ChartCanvas] triggerEvent');
    // console.log("triggering ->", type);

    // this.subscriptions.forEach(each => {
    //   const state = {
    //     ...this.state,
    //     fullData: this.fullData,
    //     subscriptions: this.subscriptions
    //   };
    //   each.listener(type, props, state, e);
    // });
  }

  private getAllPanConditions() {
    console.log('[ChartCanvas] getAllPanConditions');
    // return this.subscriptions.map(each => each.getPanConditions());
    return [];
  }

  private isInteractionEnabled(xScale, xAccessor, data) {
    const interaction =
      !isNaN(xScale(xAccessor(head(data)))) && isDefined(xScale.invert);
    return interaction;
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
