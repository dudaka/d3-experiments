import { functor } from '../utils';

export const genericComponentOptionsDefaults = {
  svgDraw: functor(null),
  draw: [],
  // canvasToDraw: contexts => contexts.mouseCoord,
  clip: true,
  // edgeClip: false,
  // selected: false,
  // disablePan: false,
  // enableDragOnHover: false,

  // onClickWhenHover: noop,
  // onClickOutside: noop,
  // onDragStart: noop,
  // onMouseMove: noop,
  // onMouseDown: noop,
  // debug: noop,
};
