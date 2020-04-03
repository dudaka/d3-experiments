import { Selection } from 'd3-selection';
import { genericComponentOptionsDefaults } from '../options/generic-component-options-defaults';
import { isDefined } from '../utils';
import { Autobind } from '../utils/autobind';
import { Subject, Subscription } from 'rxjs';

const aliases = {
  mouseleave: 'mousemove', // to draw interactive after mouse exit
  panend: 'pan',
  pinchzoom: 'pan',
  mousedown: 'mousemove',
  click: 'mousemove',
  contextmenu: 'mousemove',
  dblclick: 'mousemove',
  dragstart: 'drag',
  dragend: 'drag',
  dragcancel: 'drag',
};

export abstract class GenericComponent {

  private node: Selection<SVGGElement, unknown, null, undefined>;


  private moreProps: any;
  // private suscriberId: number | string;
  // private evaluationInProgress: boolean;
  private state: any;
  // private iSetTheCursorClass: boolean;
  // private dragInProgress: boolean;
  // private someDragInProgress: boolean;

  private context: any;
  protected props: any;
  private subscription: Subscription;

  constructor() {

    this.moreProps = {};
    this.state = {
      updateCount: 0,
    };

    // const { generateSubscriptionId } = context;
    // this.suscriberId = generateSubscriptionId();

    // const { subscribe, chartId } = this.context;
    // const { clip, edgeClip } = this.options;

    // subscribe(this.suscriberId,
    //   {
    //     chartId, clip, edgeClip,
    //     listener: this.listener,
    //     draw: this.draw,
    //     getPanConditions: this.getPanConditions,
    //   }
    // );

    // this.render();
  }

  setContext(context: any) {
    this.context = context;
  }

  setSubscription(subject: Subject<any>) {
    this.subscription = subject.subscribe(message => {
      console.log(message);
    });
  }

  removeSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @Autobind
  private getPanConditions() {
    console.log('[GenericComponent] getPanConditions');
    // const draggable = (
    //   !!(this.options.selected && this.moreProps.hovering)
    //   || (this.options.enableDragOnHover && this.moreProps.hovering)
    // );

    // return {
    //   draggable,
    //   panEnabled: !this.options.disablePan,
    // };
  }

  @Autobind
  private draw({ trigger, force } = { trigger: '', force: false }) {
    console.log('[GenericComponent] draw');
    // const type = aliases[trigger] || trigger;
    // console.log(type);
    // const proceed = this.options.drawOn.indexOf(type) > -1;
    // console.log(proceed);
    // console.log(this.options.selected);

    // if (proceed
    //   || this.options.selected /* this is to draw as soon as you select */
    //   || force
    // ) {
    //   // const { chartCanvasType } = this.context;
    //   // const { canvasDraw } = this.option;

    //   // if (isNotDefined(canvasDraw) || chartCanvasType === "svg") {
    //   const { updateCount } = this.state;
    //   this.setState({
    //     updateCount: updateCount + 1,
    //   });
    //   // } else {
    //   // 	this.drawOnCanvas();
    //   // }
    // }
  }

  private preEvaluate(type, moreProps, e) {
    console.log('[GenericComponent] preEvaluate');
  }

  private shouldTypeProceed(type, moreProps) {
    console.log('[GenericComponent] shouldTypeProceed');
    return true;
  }

  private isHover(e) {
    console.log("[GenericComponent] isHover");
    // return isDefined(this.options.isHover)
    //   ? this.options.isHover(this.getMoreProps(), e)
    //   : false;
  }

  @Autobind
  private evaluateType(type, e) {
    console.log('[GenericComponent] evaluateType');
    // const newType = aliases[type] || type;
    // const proceed = this.options.drawOn.indexOf(newType) > -1;

    // // console.log("type ->", type, proceed);

    // if (!proceed) { return; }
    // // const moreProps = this.getMoreProps();
    // this.preEvaluate(type, this.moreProps, e);
    // if (!this.shouldTypeProceed(type, this.moreProps)) { return; }

    // switch (type) {
    //   case 'zoom':
    //   case 'mouseenter':
    //     // DO NOT DRAW FOR THESE EVENTS
    //     break;
    //   case 'mouseleave': {
    //     this.moreProps.hovering = false;
    //     const moreProps = this.getMoreProps();

    //     if (this.options.onUnHover) {
    //       this.options.onUnHover(moreProps, e);
    //     }
    //     break;
    //   }
    //   case 'contextmenu': {
    //     if (this.options.onContextMenu) {
    //       this.options.onContextMenu(this.getMoreProps(), e);
    //     }
    //     if (
    //       this.moreProps.hovering
    //       && this.options.onContextMenuWhenHover
    //     ) {
    //       this.options.onContextMenuWhenHover(this.getMoreProps(), e);
    //     }
    //     break;
    //   }
    //   case 'mousedown': {
    //     if (this.options.onMouseDown) {
    //       this.options.onMouseDown(this.getMoreProps(), e);
    //     }
    //     break;
    //   }
    //   case 'click': {
    //     const moreProps = this.getMoreProps();
    //     if (this.moreProps.hovering) {
    //       // console.error("TODO use this only for SAR, Line series")
    //       this.options.onClickWhenHover(moreProps, e);
    //     } else {
    //       this.options.onClickOutside(moreProps, e);
    //     }
    //     if (this.options.onClick) {
    //       this.options.onClick(moreProps, e);
    //     }
    //     break;
    //   }
    //   case 'mousemove': {

    //     const prevHover = this.moreProps.hovering;
    //     this.moreProps.hovering = this.isHover(e);

    //     const { amIOnTop, setCursorClass } = this.context;

    //     if (this.moreProps.hovering
    //       && !this.options.selected
    //       /* && !prevHover */
    //       && amIOnTop(this.suscriberId)
    //       && isDefined(this.options.onHover)) {
    //       setCursorClass('react-stockcharts-pointer-cursor');
    //       this.iSetTheCursorClass = true;
    //     } else if (this.moreProps.hovering
    //       && this.options.selected
    //       && amIOnTop(this.suscriberId)) {
    //       setCursorClass(this.options.interactiveCursorClass);
    //       this.iSetTheCursorClass = true;
    //     } else if (prevHover
    //       && !this.moreProps.hovering
    //       && this.iSetTheCursorClass) {
    //       this.iSetTheCursorClass = false;
    //       setCursorClass(null);
    //     }
    //     const moreProps = this.getMoreProps();

    //     if (this.moreProps.hovering && !prevHover) {
    //       if (this.options.onHover) {
    //         this.options.onHover(moreProps, e);
    //       }
    //     }
    //     if (prevHover && !this.moreProps.hovering) {
    //       if (this.options.onUnHover) {
    //         this.options.onUnHover(moreProps, e);
    //       }
    //     }

    //     if (this.options.onMouseMove) {
    //       this.options.onMouseMove(moreProps, e);
    //     }
    //     break;
    //   }
    //   case 'dblclick': {
    //     const moreProps = this.getMoreProps();

    //     if (this.options.onDoubleClick) {
    //       this.options.onDoubleClick(moreProps, e);
    //     }
    //     if (
    //       this.moreProps.hovering
    //       && this.options.onDoubleClickWhenHover
    //     ) {
    //       this.options.onDoubleClickWhenHover(moreProps, e);
    //     }
    //     break;
    //   }
    //   case 'pan': {
    //     this.moreProps.hovering = false;
    //     if (this.options.onPan) {
    //       this.options.onPan(this.getMoreProps(), e);
    //     }
    //     break;
    //   }
    //   case 'panend': {
    //     if (this.options.onPanEnd) {
    //       this.options.onPanEnd(this.getMoreProps(), e);
    //     }
    //     break;
    //   }
    //   case 'dragstart': {
    //     if (this.getPanConditions().draggable) {
    //       const { amIOnTop } = this.context;
    //       if (amIOnTop(this.suscriberId)) {
    //         this.dragInProgress = true;
    //         this.options.onDragStart(this.getMoreProps(), e);
    //       }
    //     }
    //     this.someDragInProgress = true;
    //     break;
    //   }
    //   case 'drag': {
    //     if (this.dragInProgress && this.options.onDrag) {
    //       this.options.onDrag(this.getMoreProps(), e);
    //     }
    //     break;
    //   }
    //   case 'dragend': {
    //     if (this.dragInProgress && this.options.onDragComplete) {
    //       this.options.onDragComplete(this.getMoreProps(), e);
    //     }
    //     this.dragInProgress = false;
    //     this.someDragInProgress = false;
    //     break;
    //   }
    //   case 'dragcancel': {
    //     if (this.dragInProgress || this.iSetTheCursorClass) {
    //       const { setCursorClass } = this.context;
    //       setCursorClass(null);
    //     }
    //     break;
    //   }
    // }
  }

  private setState(state: any) {
    this.state = {
      ...this.state,
      ...state
    };
  }

  @Autobind
  private listener(type, moreProps, state, e) {
    console.log('[GenericComponent] listener');
    // // console.log(e.shiftKey)
    // if (isDefined(moreProps)) {
    //   this.updateMoreProps(moreProps);
    // }
    // this.evaluationInProgress = true;
    // this.evaluateType(type, e);
    // this.evaluationInProgress = false;
  }

  private updateMoreProps(moreProps) {
    console.log('[GenericComponent] updateMoreProps');
    Object.keys(moreProps).forEach(key => {
      this.moreProps[key] = moreProps[key];
    });
  }

  render() {

    const { chartId } = this.context;
    const { clip, svgDraw } = this.props;

    // console.log(chartId);

    // if (isDefined(canvasDraw) && chartCanvasType !== "svg") {
    // 	return null;
    // }

    const suffix = isDefined(chartId) ? '-' + chartId : '';

    if (clip) {
      this.node.style('clipPath', `url(#chart-area-clip${suffix})`);
    }

    // return <g style={ style }> { svgDraw(this.getMoreProps()) } < /g>;
    const moreProps = this.getMoreProps();

    svgDraw(moreProps);
  }

  private getMoreProps() {
    const {
      xScale,
      plotData,
      chartConfig,
      morePropsDecorator,
      xAccessor,
      displayXAccessor,
      width,
      height,
    } = this.context;

    // console.log('context', this.context);

    const { chartId, fullData } = this.context;

    const moreProps = {
      xScale, plotData, chartConfig,
      xAccessor, displayXAccessor,
      width, height,
      chartId,
      fullData,
      ...this.moreProps,
    };

    return (morePropsDecorator || (d => d))(moreProps);
  }

}
