import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { select as d3Select } from 'd3-selection';
import { ScaleTime as d3ScaleTime } from 'd3-scale';
import { min as d3Min, max as d3Max } from 'd3-array';
import { isNotDefined } from '../utils';
import { chartCanvasOptionDefaults, getCursorStyle } from '../options/chart-canvas-options-defaults';

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

  @ViewChild('svg', { static: true }) private svgEl: ElementRef;
  private props: any;

  constructor() { }

  ngOnInit(): void {

    this.initializeDefaultProperties();

    console.log(this.props);

    const { className, width, height, zIndex } = this.props;

    this.className = className;
    this.width = width;
    this.height = height;

    const svg = d3Select(this.svgEl.nativeElement)
      .attr('class', className)
      .attr('width', width)
      .attr('height', height)
      // .style('position', 'absolute')
      .style('z-index', zIndex + 5);

    svg.append('style')
      .attr('type', 'text/css')
      .text(getCursorStyle(className));
  }

  private initializeDefaultProperties() {
    console.log(this.options);
    this.props = {
      ...chartCanvasOptionDefaults,
      ...this.options
    };
  }

}
