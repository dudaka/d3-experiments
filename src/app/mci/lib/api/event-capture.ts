
import { eventCaptureOptionDefaults } from '../options/event-capture-options-defaults';

import {
  Selection,
  select as d3Select,
  event as d3Event,
  mouse as d3Mouse,
  touches as d3Touches
} from 'd3-selection';
import { Autobind } from '../utils/autobind';
import {
  MOUSEENTER,
  MOUSELEAVE,
  d3Window,
  MOUSEMOVE,
  getTouchProps,
  touchPosition,
  TOUCHMOVE,
  TOUCHEND,
  MOUSEUP,
  isDefined,
  mousePosition
} from '../utils';
import { getCurrentCharts } from '../utils/chartUtils';

export class EventCapture {

  private options: any;
  private focus: boolean;
  private state: any;
  private node: any;
  private eventCaptureRect: Selection<SVGRectElement, unknown, null, undefined>;
  private mouseInside: boolean;
  private mouseInteraction: boolean;
  private panHappened: boolean;
  private lastNewPos: any;
  private dx: number;
  private dy: number;
  private dragHappened: boolean;
  private clicked: boolean;
  private panEndTimeout: any;

  constructor(selection: Selection<SVGGElement, unknown, null, undefined>, options?: any) {
    this.options = {
      ...eventCaptureOptionDefaults,
      ...options
    };

    this.state = {
      panInProgress: false,
    };

    this.mouseInside = false;
    this.mouseInteraction = true;

    this.focus = this.options.focus;

    // console.log(this.options);

    this.render(selection);

    this.addDefaultEvents();

  }

  private addDefaultEvents() {
    if (this.node) {
      d3Select(this.node)
        .on(MOUSEENTER, this.handleEnter)
        .on(MOUSELEAVE, this.handleLeave);
    }
  }

  private render(selection: Selection<SVGGElement, unknown, null, undefined>) {
    const { height, width, disableInteraction, useCrossHairStyleCursor } = this.options;
    const className = this.state.cursorOverrideClass != null
      ? this.state.cursorOverrideClass
      : !useCrossHairStyleCursor ? '' : this.state.panInProgress
        ? 'trading-chart-grabbing-cursor'
        : 'trading-chart-crosshair-cursor';

    // const interactionProps = disableInteraction || {
    //   onWheel: this.handleWheel,
    //   onMouseDown: this.handleMouseDown,
    //   onClick: this.handleClick,
    //   onContextMenu: this.handleRightClick,
    //   onTouchStart: this.handleTouchStart,
    //   onTouchMove: this.handleTouchMove,
    // };

    this.eventCaptureRect = selection.append('rect')
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      .style('opacity', 0);

    if (!disableInteraction) {
      this.eventCaptureRect
        .on('wheel', this.handleWheel)
        .on('mousedown', this.handleMouseDown)
        .on('click', this.handleClick)
        .on('contextmenu', this.handleRightClick)
        .on('touchstart', this.handleTouchStart)
        .on('touchmove', this.handleTouchMove);
    }

    this.node = (this.eventCaptureRect as any)._groups[0][0];

  }

  @Autobind
  private handleEnter() {
    console.log('[EventCapture] handleEnter');

    const e = d3Event;

    const { onMouseEnter } = this.options;
    this.mouseInside = true;
    if (!this.state.panInProgress && !this.state.dragInProgress) {
      const win = d3Window(this.node);
      d3Select(win).on(MOUSEMOVE, this.handleMouseMove);
    }
    onMouseEnter(e);
  }

  @Autobind
  private handleMouseMove() {
    console.log('[EventCapture] handleMouseMove');
    const e = d3Event;
    const { mouseMove, onMouseMove } = this.options;

    // console.log(this.mouseInteraction);
    // console.log(mouseMove);
    // console.log(this.state.panInProgress);

    if (this.mouseInteraction && mouseMove && !this.state.panInProgress) {
      const newPos = d3Mouse(this.node);
      onMouseMove(newPos, 'mouse', e);
    }
  }


  @Autobind
  private handleLeave(e) {
    console.log('[EventCapture] handleLeave');

    const { onMouseLeave } = this.options;

    this.mouseInside = false;
    if (!this.state.panInProgress && !this.state.dragInProgress) {
      const win = d3Window(this.node);
      d3Select(win).on(MOUSEMOVE, null);
    }
    onMouseLeave(e);
  }

  @Autobind
  private handleTouchMove(e) {
    console.log('[EventCapture] handleTouchMove');
    const { onMouseMove } = this.options;
    const touchXY = touchPosition(getTouchProps(e.touches[0]), e);
    onMouseMove(touchXY, 'touch', e);
  }

  @Autobind
  private handleTouchStart(e) {
    console.log('[EventCapture] handleTouchStart');
    this.mouseInteraction = false;

    const { pan: panEnabled, chartConfig, onMouseMove } = this.options;
    const { xScale, onPanEnd } = this.options;

    if (e.touches.length === 1) {

      this.panHappened = false;
      const touchXY = touchPosition(getTouchProps(e.touches[0]), e);
      onMouseMove(touchXY, 'touch', e);

      if (panEnabled) {
        const currentCharts = getCurrentCharts(chartConfig(), touchXY);

        this.setState({
          panInProgress: true,
          panStart: {
            panStartXScale: xScale,
            panOrigin: touchXY,
            chartsToPan: currentCharts,
          }
        });

        const win = d3Window(this.node);
        d3Select(win)
          .on(TOUCHMOVE, this.handlePan, false)
          .on(TOUCHEND, this.handlePanEnd, false);

      }
    } else if (e.touches.length === 2) {
      // pinch zoom begin
      // do nothing pinch zoom is handled in handleTouchMove
      const { panInProgress, panStart } = this.state;

      if (panInProgress && panEnabled && onPanEnd) {
        const { panStartXScale, panOrigin, chartsToPan } = panStart;

        const win = d3Window(this.node);
        d3Select(win)
          .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
          .on(MOUSEUP, null)
          .on(TOUCHMOVE, this.handlePinchZoom, false)
          .on(TOUCHEND, this.handlePinchZoomEnd, false);

        const touch1Pos = touchPosition(getTouchProps(e.touches[0]), e);
        const touch2Pos = touchPosition(getTouchProps(e.touches[1]), e);

        if (this.panHappened
          // && !this.contextMenuClicked
          && panEnabled
          && onPanEnd) {

          onPanEnd(this.lastNewPos, panStartXScale, panOrigin, chartsToPan, e);
        }

        this.setState({
          panInProgress: false,
          pinchZoomStart: {
            xScale,
            touch1Pos,
            touch2Pos,
            range: xScale.range(),
            chartsToPan,
          }
        });
      }
    }
  }

  private setState(state: any) {
    this.state = {
      ...this.state,
      ...state
    };
  }

  @Autobind
  handlePinchZoom() {
    console.log('[EventCapture] handlePinchZoom');
    const e = d3Event;
    const [touch1Pos, touch2Pos] = d3Touches(this.node);
    const { xScale, zoom: zoomEnabled, onPinchZoom } = this.options;

    // eslint-disable-next-line no-unused-vars
    const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;

    if (zoomEnabled && onPinchZoom) {
      onPinchZoom(initialPinch, {
        touch1Pos,
        touch2Pos,
        xScale,
      }, e);
    }
  }

  @Autobind
  private handlePinchZoomEnd() {
    console.log('[EventCapture] handlePinchZoomEnd');
    const e = d3Event;

    const win = d3Window(this.node);
    d3Select(win)
      .on(TOUCHMOVE, null)
      .on(TOUCHEND, null);

    const { zoom: zoomEnabled, onPinchZoomEnd } = this.options;

    // eslint-disable-next-line no-unused-vars
    const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;

    if (zoomEnabled && onPinchZoomEnd) {
      onPinchZoomEnd(initialPinch, e);
    }

    this.setState({
      pinchZoomStart: null
    });
  }

  @Autobind
  private handlePan() {
    console.log('[EventCapture] handlePan');
    const e = d3Event;

    if (this.shouldPan()) {
      this.panHappened = true;

      const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;

      const mouseXY = this.mouseInteraction
        ? d3Mouse(this.node)
        : d3Touches(this.node)[0];

      this.lastNewPos = mouseXY;
      const dx = mouseXY[0] - panOrigin[0];
      const dy = mouseXY[1] - panOrigin[1];

      this.dx = dx;
      this.dy = dy;

      this.options.onPan(
        mouseXY, panStartXScale, { dx, dy }, chartsToPan, e
      );
    }
  }

  private shouldPan() {
    console.log('[EventCapture] shouldPan');
    const { pan: panEnabled, onPan } = this.options;
    return panEnabled
      && onPan
      && isDefined(this.state.panStart);
  }

  @Autobind
  private handlePanEnd() {
    console.log('[EventCapture] handlePanEnd');
    const e = d3Event;
    const { pan: panEnabled, onPanEnd } = this.options;

    if (isDefined(this.state.panStart)) {
      const { panStartXScale, chartsToPan } = this.state.panStart;

      const win = d3Window(this.node);
      d3Select(win)
        .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
        .on(MOUSEUP, null)
        .on(TOUCHMOVE, null)
        .on(TOUCHEND, null);

      if (this.panHappened
        // && !this.contextMenuClicked
        && panEnabled
        && onPanEnd) {
        const { dx, dy } = this;

        // console.log(dx, dy)
        delete this.dx;
        delete this.dy;
        onPanEnd(this.lastNewPos, panStartXScale, { dx, dy }, chartsToPan, e);
      }

      this.setState({
        panInProgress: false,
        panStart: null,
      });
    }
  }

  @Autobind
  private handleRightClick(e) {
    console.log('[EventCapture] handleRightClick');
    e.stopPropagation();
    e.preventDefault();
    const { onContextMenu, onPanEnd } = this.options;

    const mouseXY = mousePosition(e, this.node.getBoundingClientRect());

    if (isDefined(this.state.panStart)) {
      const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;
      if (this.panHappened) {
        onPanEnd(mouseXY, panStartXScale, panOrigin, chartsToPan, e);
      }
      const win = d3Window(this.node);
      d3Select(win)
        .on(MOUSEMOVE, null)
        .on(MOUSEUP, null);

      this.setState({
        panInProgress: false,
        panStart: null,
      });
    }

    onContextMenu(mouseXY, e);
  }

  @Autobind
  private handleClick() {
    console.log('[EventCapture] handleClick');
    const e = d3Event;
    const mouseXY = mousePosition(e);
    const { onClick, onDoubleClick } = this.options;

    if (!this.panHappened && !this.dragHappened) {
      if (this.clicked) {
        onDoubleClick(mouseXY, e);
        this.clicked = false;
      } else {
        onClick(mouseXY, e);
        this.clicked = true;
        setTimeout(() => {
          if (this.clicked) {
            this.clicked = false;
          }
        }, 400);
      }
    }
  }

  @Autobind
  private handleMouseDown() {
    console.log('[EventCapture] handleMouseDown');

    const e = d3Event;
    // console.log('mouseXY =', d3Mouse(this.node));

    // console.log(e);

    if (e.button !== 0) {
      return;
    }

    const { xScale, chartConfigs, onMouseDown } = this.options;

    console.log(chartConfigs);

    this.panHappened = false;
    this.dragHappened = false;
    this.focus = true;

    if (!this.state.panInProgress && this.mouseInteraction) {
      const mouseXY = mousePosition(e);
      const currentCharts = getCurrentCharts(chartConfigs(), mouseXY);
      const {
        panEnabled, somethingSelected
      } = this.canPan();
      const pan = panEnabled && !somethingSelected;

      if (pan) {
        this.setState({
          panInProgress: pan,
          panStart: {
            panStartXScale: xScale,
            panOrigin: mouseXY,
            chartsToPan: currentCharts
          },
        });

        const win = d3Window(this.node);
        d3Select(win)
          .on(MOUSEMOVE, this.handlePan)
          .on(MOUSEUP, this.handlePanEnd);

      } else if (somethingSelected) {
        this.setState({
          panInProgress: false,
          dragInProgress: true,
          panStart: null,
          dragStartPosition: mouseXY,
        });
        this.options.onDragStart({ startPos: mouseXY }, e);
        // this.mouseInteraction = false;

        const win = d3Window(this.node);
        d3Select(win)
          .on(MOUSEMOVE, this.handleDrag)
          .on(MOUSEUP, this.handleDragEnd);
      }

      onMouseDown(mouseXY, currentCharts, e);
    }
    e.preventDefault();
  }

  @Autobind
  private handleDrag() {
    console.log('[EventCapture] handleDrag');
    const e = d3Event;
    if (this.options.onDrag) {
      this.dragHappened = true;
      const mouseXY = d3Mouse(this.node);
      this.options.onDrag({
        startPos: this.state.dragStartPosition,
        mouseXY
      }, e);
    }
  }

  @Autobind
  private handleDragEnd() {
    console.log('[EventCapture] handleDragEnd');
    const e = d3Event;
    const mouseXY = d3Mouse(this.node);

    const win = d3Window(this.node);
    d3Select(win)
      .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
      .on(MOUSEUP, null);

    if (this.dragHappened) {
      this.options.onDragComplete({
        mouseXY
      }, e);
    }

    this.setState({
      dragInProgress: false,
    });
    this.mouseInteraction = true;
  }

  private canPan() {
    console.log('[EventCapture] canPan');
    const { getAllPanConditions } = this.options;
    const { pan: initialPanEnabled } = this.options;

    const {
      panEnabled,
      draggable: somethingSelected
    } = getAllPanConditions()
      .reduce((returnObj, a) => {
        return {
          draggable: returnObj.draggable || a.draggable,
          panEnabled: returnObj.panEnabled && a.panEnabled,
        };
      }, {
        draggable: false,
        panEnabled: initialPanEnabled,
      });

    return {
      panEnabled,
      somethingSelected
    };
  }

  @Autobind
  private handleWheel() {

    const e = d3Event;

    console.log('[EventCapture] handleWheel');
    const { zoom, onZoom } = this.options;
    const { panInProgress } = this.state;

    const yZoom = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 0;
    // const xPan = Math.abs(e.deltaY) < Math.abs(e.deltaX) && Math.abs(e.deltaX) > 0;
    const mouseXY = mousePosition(e);
    e.preventDefault();

    if (zoom && this.focus && yZoom && !panInProgress) {
      const zoomDir = e.deltaY > 0 ? 1 : -1;

      onZoom(zoomDir, mouseXY, e);
    } else if (this.focus) {
      if (this.shouldPan()) {
        // console.log("Do pan now...")
        // pan already in progress
        const {
          panStartXScale,
          chartsToPan
        } = this.state.panStart;
        this.lastNewPos = mouseXY;
        this.panHappened = true;

        this.dx += e.deltaX;
        this.dy += e.deltaY;
        const dxdy = { dx: this.dx, dy: this.dy };

        this.options.onPan(mouseXY, panStartXScale, dxdy, chartsToPan, e);
      } else {
        // console.log("Pan start...")
        // pan start

        const { xScale, chartConfig } = this.options;
        const currentCharts = getCurrentCharts(chartConfig, mouseXY);

        this.dx = 0;
        this.dy = 0;
        this.setState({
          panInProgress: true,
          panStart: {
            panStartXScale: xScale,
            panOrigin: mouseXY,
            chartsToPan: currentCharts
          },
        });
      }
      this.queuePanEnd();
    }
  }

  private queuePanEnd() {
    console.log('[EventCapture] queuePanEnd');
    if (isDefined(this.panEndTimeout)) {
      clearTimeout(this.panEndTimeout);
    }
    this.panEndTimeout = setTimeout(() => {
      this.handlePanEnd();
    }, 100);
  }
}
