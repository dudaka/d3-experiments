import { Selection } from 'd3-selection';
import { genericComponentOptionsDefaults } from '../options/generic-component-options-defaults';
import { isDefined } from '../utils';

export class GenericComponent {

  private node: Selection<SVGGElement, unknown, null, undefined>;
  private context: any;
  private option: any;
  private moreProps: any;

  constructor(node: Selection<SVGGElement, unknown, null, undefined>, context: any, options?: any) {

    this.node = node;
    this.context = context;

    this.option = {
      ...genericComponentOptionsDefaults,
      ...options
    };

    this.moreProps = {};
  }

  draw() {

    const { chartId } = this.context;
    const { clip, svgDraw } = this.option;

    console.log(chartId);

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

    console.log('context', this.context);

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
