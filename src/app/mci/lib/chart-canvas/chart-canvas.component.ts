import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { select as d3Select } from 'd3-selection';
import { ScaleTime as d3ScaleTime } from 'd3-scale';
import { min as d3Min, max as d3Max } from 'd3-array';
import { isNotDefined } from '../utils';
import { chartCanvasOptionDefaults, getCursorStyle } from '../options/chart-canvas-options-defaults';
import { Autobind } from '../utils/autobind';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-canvas',
  templateUrl: './chart-canvas.component.html',
  styleUrls: ['./chart-canvas.component.scss']
})
export class ChartCanvasComponent implements OnInit {

  @Input() options: any;

  // properties
  // private plotData: any[];
  // private fullData: any[];
  // private chartConfigs: any[];
  width: number;
  height: number;
  // @Input() margin: { left: number, right: number, top: number, bottom: number };
  className: string;
  // private zIndex: number;
  // @Input() xScale: d3ScaleTime<number, number>;
  // @Input() xAccessor: Function;
  // @Input() xExtents: any[] | Function;
  // private displayXAccessor: Function;
  // // private chartCanvasType: 'svg' | 'hybrid';
  // // @Input() ratio: number,
  // private getCanvasContexts: Function;
  // private xAxisZoom: Function;
  // private yAxisZoom: Function;
  // private amIOnTop: Function;
  // private redraw: Function;
  // private subscribe: Function;
  // private unsubscribe: Function;
  // private setCursorClass: Function
  // private generateSubscriptionId: Function;
  // private getMutableState: Function;
  // private useCrossHairStyleCursor: boolean;
  // private flipXScale: boolean;
  // private padding: number;
  // private clamp: any;
  // private pointsPerPxThreshold: number;
  // private minPointsPerPxThreshold: number;
  // private postCalculator: Function;
  // private mouseMoveEvent: boolean;
  // private zoomEvent: boolean;
  // private panEvent: boolean;
  // private defaultFocus: boolean;
  // private disableInteraction: boolean;

  // @Input() data: any[];

  @ViewChild('chartCanvas', { static: true}) private chartCanvasEl: ElementRef;
  @ViewChild('svg', { static: true }) private svgEl: ElementRef;
  @ViewChild('charts', { static: true }) private chartsEl: ElementRef;

  private props: any;
  private state: any;

  constructor(private renderer: Renderer2) {
    this.state = {};
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
    console.log(this.options);
    this.props = {
      ...chartCanvasOptionDefaults,
      ...this.options
    };
  }

}
