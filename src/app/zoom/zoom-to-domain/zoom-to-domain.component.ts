import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-zoom-to-domain',
  templateUrl: './zoom-to-domain.component.html',
  styleUrls: ['./zoom-to-domain.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ZoomToDomainComponent implements OnInit {

  @ViewChild('chart', { static: true }) private svgEl: ElementRef;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  x: d3.ScaleTime<number, number>;
  area: d3.Area<[number, number]>;
  xAxis: d3.Axis<number | Date | { valueOf(): number; }>;

  constructor() { }

  ngOnInit(): void {
    const svg = d3.select(this.svgEl.nativeElement);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;



    this.x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    this.xAxis = d3.axisBottom(this.x);
    const yAxis = d3.axisLeft(y);

    const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', this.zoomed.bind(this));

    this.area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d: any) => this.x(d.date))
      .y0(height)
      .y1((d: any) => y(d.price));

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    this.g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('assets/data/sp500.csv').then((rawData: d3.DSVRowArray<string>) => {

      const data = rawData.map(this.type.bind(this));

      this.x.domain(d3.extent(data, (d: any) => d.date));
      y.domain([0, d3.max(data, (d: any) => d.price)]);

      this.g.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', this.area);

      this.g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(this.xAxis);

      this.g.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

      const d0 = new Date(2003, 0, 1);
      const d1 = new Date(2004, 0, 1);

      // Gratuitous intro zoom!
      svg.call(zoom).transition()
        .duration(1500)
        .call(zoom.transform, d3.zoomIdentity
          .scale(width / (this.x(d1) - this.x(d0)))
          .translate(-this.x(d0), 0));
    });
  }

  private zoomed() {
    const t = d3.event.transform;
    const xt = t.rescaleX(this.x);
    this.g.select('.area').attr('d', this.area.x((d: any) => xt(d.date)));
    this.g.select('.axis--x').call(this.xAxis.scale(xt));
  }

  private type(d) {
    const parseDate = d3.timeParse('%b %Y');
    d.date = parseDate(d.date);
    d.price = +d.price;
    return d;
  }

}
