import * as d3 from 'd3';
import { isNotDefined } from '../utils';

export const chartCanvasOptionDefaults = {
  className: 'trading-chart',
  zIndex: 1,
  margin: { top: 20, right: 30, bottom: 30, left: 80 },
  xExtents: [d3.min, d3.max],
  xAccessor: d => d,
  useCrossHairStyleCursor: true,
  flipXScale: false,
  padding: 0,
  clamp: false,
  pointsPerPxThreshold: 2,
  minPointsPerPxThreshold: 1 / 100,
  displayXAccessor: (props, propName /* , componentName */) => {
    if (isNotDefined(props[propName])) {
      console.warn(
        '`displayXAccessor` is not defined,' +
        ' will use the value from `xAccessor` as `displayXAccessor`.' +
        ' This might be ok if you do not use a discontinuous scale' +
        ' but if you do, provide a `displayXAccessor` prop to `ChartCanvas`'
      );
    } else if (typeof props[propName] !== 'function') {
      return new Error('displayXAccessor has to be a function');
    }
  },
  postCalculator: d => d,
  mouseMoveEvent: true,
  zoomEvent: true,
  panEvent: true,
  defaultFocus: true,
  disableInteraction: false
};
