import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-pan-zoom-axes',
  templateUrl: './pan-zoom-axes.component.html',
  styleUrls: ['./pan-zoom-axes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PanZoomAxesComponent implements OnInit {

  @ViewChild('chart', {static: true}) private svgEl: ElementRef;
  view: d3.Selection<SVGRectElement, unknown, null, undefined>;
  gX: d3.Selection<SVGGElement, unknown, null, undefined>;
  gY: d3.Selection<SVGGElement, unknown, null, undefined>;
  xAxis: d3.Axis<number | { valueOf(): number; }>;
  yAxis: d3.Axis<number | { valueOf(): number; }>;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  svg: d3.Selection<any, unknown, null, undefined>;
  zoom: d3.ZoomBehavior<Element, unknown>;

  constructor() { }

  ngOnInit(): void {
    this.svg = d3.select(this.svgEl.nativeElement);
    const width = +this.svg.attr('width');
    const height = +this.svg.attr('height');

    this.zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [width + 90, height + 100]])
      .on('zoom', this.zoomed.bind(this));

    this.x = d3.scaleLinear()
      .domain([-1, width + 1])
      .range([-1, width + 1]);

    this.y = d3.scaleLinear()
      .domain([-1, height + 1])
      .range([-1, height + 1]);

    this.xAxis = d3.axisBottom(this.x)
      .ticks((width + 2) / (height + 2) * 10)
      .tickSize(height)
      .tickPadding(8 - height);

    this.yAxis = d3.axisRight(this.y)
      .ticks(10)
      .tickSize(width)
      .tickPadding(8 - width);

    this.view = this.svg.append('rect')
      .attr('class', 'view')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', width - 1)
      .attr('height', height - 1);

    this.gX = this.svg.append('g')
      .attr('class', 'axis axis--x')
      .call(this.xAxis);

    this.gY = this.svg.append('g')
    .attr('class', 'axis axis--y')
    .call(this.yAxis);

    this.svg.call(this.zoom);
  }

  private zoomed() {
    this.view.attr('transform', d3.event.transform);
    this.gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
    this.gY.call(this.yAxis.scale(d3.event.transform.rescaleY(this.y)));
  }

  resetted() {
    this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
  }

}
