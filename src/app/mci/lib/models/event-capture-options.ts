export interface EventCaptureOptions {
  mouseMove: boolean;
  zoom: boolean;
  pan: boolean;
  panSpeedMultiplier: number;
  focus: boolean;
  useCrossHairStyleCursor: boolean;

  width: number;
  height: number;
  chartConfig: any[];
  xScale: Function;
  xAccessor: Function;
  disableInteraction: boolean;

  getAllPanConditions: Function;

  onMouseMove: Function;
  onMouseEnter: Function;
  onMouseLeave: Function;
  onZoom: Function;
  onPinchZoom: Function;
  onPinchZoomEnd: Function;
  onPan: Function;
  onPanEnd: Function;
  onDragStart: Function;
  onDrag: Function;
  onDragComplete: Function;

  onClick: Function;
  onDoubleClick: Function;
  onContextMenu: Function;
  onMouseDown: Function;
  // children: PropTypes.node,
}
