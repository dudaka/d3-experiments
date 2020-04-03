import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { select as d3Select } from 'd3-selection';
import { ScaleTime as d3ScaleTime } from 'd3-scale';
import { min as d3Min, max as d3Max } from 'd3-array';
import { isNotDefined, functor, isDefined } from '../utils';
import { chartCanvasOptionDefaults, getCursorStyle } from '../options/chart-canvas-options-defaults';
import { Autobind } from '../utils/autobind';
import { ChartComponent } from '../chart/chart.component';
import { getNewChartConfig, getChartConfigWithUpdatedYScales } from '../utils/chartUtils';

import { extent as d3Extent } from 'd3-array';
import evaluator from '../scale/evaluator';
import { Subject } from 'rxjs';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-canvas',
  templateUrl: './chart-canvas.component.html',
  styleUrls: ['./chart-canvas.component.scss']
})
export class ChartCanvasComponent implements OnInit, AfterContentInit {

  @Input() options: any;

  @ViewChild('chartCanvas', { static: true}) private chartCanvasEl: ElementRef;
  @ViewChild('svg', { static: true }) private svgEl: ElementRef;
  @ViewChild('charts', { static: true }) private chartsEl: ElementRef;
  @ContentChildren(ChartComponent) private contentCharts: QueryList<ChartComponent>;

  private subject = new Subject<any>();

  private props: any;
  private state: any;
  fullData: any;

  constructor(private renderer: Renderer2) {
    this.state = {};
  }

  ngAfterContentInit(): void {
    const children = this.contentCharts.map(content => content.getProps());

    this.props = {
      ...this.props,
      children
    };

    const { fullData, ...state } = this.resetChart(true);
    this.fullData = fullData;

    this.setState(state);

    d3Select(this.svgEl.nativeElement).call(this.setClipPathDefs);

    this.contentCharts.map(content => {
      content.setSubscription(this.subject);
      content.setContext(this.getChildrenContext());
    });

    this.subject.next('done');
  }

  private getChildrenContext() {
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
      margin: this.props.margin,
      // ratio: this.props.ratio,
      // xAxisZoom: this.xAxisZoom,
      // yAxisZoom: this.yAxisZoom,
      // getCanvasContexts: this.getCanvasContexts,
      // redraw: this.redraw,
      // subscribe: this.subscribe,
      // unsubscribe: this.unsubscribe,
      // generateSubscriptionId: this.generateSubscriptionId,
      // getMutableState: this.getMutableState,
      // amIOnTop: this.amIOnTop,
      // setCursorClass: this.setCursorClass
    };
  }

  private setState(state) {
    this.state = {
      ...this.state,
      ...state
    };
  }

  private resetChart(isFirstCalculation: boolean) {

    const state = this.calculateState();
    const { xAccessor, displayXAccessor, fullData } = state;
    const { plotData: initialPlotData, xScale } = state;
    // const { postCalculator, children } = props;
    const { postCalculator, children } = this.props;
    const dimensions = this.getDimensions();

    const plotData = postCalculator(initialPlotData);

    const chartConfigs = getChartConfigWithUpdatedYScales(
      getNewChartConfig(children, dimensions),
      { plotData, xAccessor, displayXAccessor, fullData },
      xScale.domain()
    );

    return {
      ...state,
      xScale,
      plotData,
      chartConfigs
    };

  }

  private getXScaleDirection(flipXScale: boolean) {
    return flipXScale ? -1 : 1;
  }

  private calculateFullData() {
    const {
      data: fullData,
      plotFull,
      xScale,
      clamp,
      pointsPerPxThreshold,
      flipXScale
    } = this.props;

    const { xAccessor, displayXAccessor, minPointsPerPxThreshold } = this.props;

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

  private calculateState() {
    const {
      xAccessor: inputXAccesor,
      xExtents: xExtentsProp,
      padding,
      flipXScale,
      data
    } = this.props;

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

  ngOnInit(): void {
    this.initializeDefaultProperties();
    this.render();
  }

  private render() {
    this.setChartCanvasPros();
    this.setSvgProps();
  }

  private setSvgProps() {
    const {
      className,
      width,
      height,
      zIndex,
      margin
    } = this.props;

    const svg = d3Select(this.svgEl.nativeElement)
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      // .style('position', 'absolute')
      .style('z-index', zIndex + 5)
      .call(this.setStyle)
      .call(this.setClipPathDefs);

    svg.select('g')
      .attr('transform', `translate(${margin.left + 0.5}, ${margin.top + 0.5})`)
      .call(this.setEventCapture);

    d3Select(this.chartsEl.nativeElement).attr( 'class', `${className}-avoid-interaction`);
  }

  @Autobind
  private setEventCapture(g) {

  }

  @Autobind
  private setClipPathDefs(g) {
    const clipPaths = [];
    const dimensions = this.getDimensions();
    clipPaths.push({
      id: 'chart-area-clip',
      x: '0',
      y: '0',
      width: dimensions.width,
      height: dimensions.height
    });

    const { chartConfigs } = this.state;
    console.log(chartConfigs);
    if (chartConfigs && chartConfigs.length > 0) {
      chartConfigs.map(chartConfig => {
        clipPaths.push({
          id: `chart-area-clip-${chartConfig.id}`,
          x: '0',
          y: '0',
          width: chartConfig.width,
          height: chartConfig.height
        });
      });
    }

    g.select('defs')
      .selectAll('clipPath')
      .data(clipPaths)
      .join('clipPath')
        .attr('id', (clipPath, idx, node) => {
          d3Select(node[idx])
            .selectAll('rect')
            .data([clipPath])
            .join('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', d => d.width)
              .attr('height', d => d.height);
          return clipPath.id;
        });

  }

  private getDimensions() {
    const { height, width, margin } = this.props;

    return {
      height: height - margin.top - margin.bottom,
      width: width - margin.left - margin.right
    };
  }

  @Autobind
  private setStyle(g) {
    const { className } = this.props;

    g.select('style')
      .text(getCursorStyle(className));
  }

  private setChartCanvasPros() {
    const { className, width, height } = this.props;
    this.renderer.addClass(this.chartCanvasEl.nativeElement, className);
    this.renderer.setStyle(this.chartCanvasEl.nativeElement, 'width', `${width}px`);
    this.renderer.setStyle(this.chartCanvasEl.nativeElement, 'height', `${height}px`);
  }

  private initializeDefaultProperties() {
    // console.log(this.options);
    this.props = {
      ...chartCanvasOptionDefaults,
      ...this.options
    };
  }

}
