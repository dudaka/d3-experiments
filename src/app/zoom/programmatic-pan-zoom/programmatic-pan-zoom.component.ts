import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-programmatic-pan-zoom',
  templateUrl: './programmatic-pan-zoom.component.html',
  styleUrls: ['./programmatic-pan-zoom.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgrammaticPanZoomComponent implements OnInit {

  @ViewChild('chart', { static: true }) private svgEl: ElementRef;
  width: number;
  height: number;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  xAxis: d3.Axis<number | { valueOf(): number; }>;
  yAxis: d3.Axis<number | { valueOf(): number; }>;
  zoom: d3.ZoomBehavior<Element, unknown>;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor() { }

  ngOnInit(): void {
    const margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    };

    this.width = 960 - margin.left - margin.right;
    this.height = 500 - margin.top - margin.bottom;

    this.x = d3.scaleLinear()
      .domain([-this.width / 2, this.width / 2])
      .range([0, this.width]);

    this.y = d3.scaleLinear()
      .domain([-this.height / 2, this.height / 2])
      .range([this.height, 0]);

    this.xAxis = d3.axisBottom(this.x)
      .tickSize(-this.height);

    this.yAxis = d3.axisLeft(this.y)
      .ticks(5)
      .tickSize(-this.width);

    this.zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', this.zoomed.bind(this));

    this.svg = d3.select(this.svgEl.nativeElement)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(this.zoom);

    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);

  }

  private zoomed() {
    this.svg.select('.x.axis').call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
    this.svg.select('.y.axis').call(this.yAxis.scale(d3.event.transform.rescaleY(this.y)));
  }

  reset() {
    this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
  }

}
