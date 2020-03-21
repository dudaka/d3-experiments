import * as d3 from 'd3';
import { isNotDefined } from '../utils';

export const chartOptionDefaults = {
  id: 0,
  origin: [0, 0],
  padding: 0,
  yScale: d3.scaleLinear(),
  flipYScale: false,
  yPan: true,
  yPanEnabled: false,
  onContextMenu: () => { },
  yExtentsCalculator: (props: any, propName: string, currentClass: string) => {
    if (isNotDefined(props.yExtents) && typeof props.yExtentsCalculator !== 'function') {
      return new Error('yExtents or yExtentsCalculator must'
        + ` be present on ${currentClass}. Validation failed.`);
    }
  }
};
