import { Selection } from 'd3-selection';
import { xAxisOptionsDefaults } from '../options/x-axis-options-defaults';
import { Autobind } from '../utils/autobind';

export class XAxis {
  private node: Selection<SVGGElement, unknown, null, undefined>;
  private context: any;
  private options: any;

  constructor(node: Selection<SVGGElement, unknown, null, undefined>, context: any, options?: any) {
    this.options = {
      ...xAxisOptionsDefaults,
      ...options
    };
    this.context = context;
    this.node = node;

    this.createAxis();
  }

  private createAxis() {
    const { showTicks } = this.options;
    const moreProps = this.helper();

    console.log(moreProps);
  }

  private helper() {
    const { axisAt, xZoomHeight, orient } = this.options;
    const { chartConfig: { width, height } } = this.context;

    let axisLocation;
    const x = 0;
    const w = width;
    const h = xZoomHeight;

    if (axisAt === 'top') {
      axisLocation = 0;
    } else if (axisAt === 'bottom') {
      axisLocation = height;
    } else if (axisAt === 'middle') {
      axisLocation = (height) / 2;
    } else { axisLocation = axisAt;
    }

    const y = (orient === 'top') ? -xZoomHeight : 0;

    return {
      transform: [0, axisLocation],
      range: [0, width],
      getScale: this.getXScale,
      bg: { x, y, h, w },
    };
  }

  private getXScale(moreProps) {
    const { xScale: scale, width } = moreProps;
    if (scale.invert) {
      const trueRange = [0, width];
      const trueDomain = trueRange.map(scale.invert);
      return scale.copy()
        .domain(trueDomain)
        .range(trueRange);
    }
    return scale;
  }

}
