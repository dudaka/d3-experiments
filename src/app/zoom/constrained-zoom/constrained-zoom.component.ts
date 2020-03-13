import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-constrained-zoom',
  templateUrl: './constrained-zoom.component.html',
  styleUrls: ['./constrained-zoom.component.scss']
})
export class ConstrainedZoomComponent implements OnInit {

  @ViewChild('chart', { static: true }) private svgEl: ElementRef;
  g: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
  width: number;
  height: number;
  x0: number;
  y0: number;
  y1: any;
  x1: any;

  constructor() { }

  ngOnInit(): void {
    const zoom = d3.zoom().on('zoom', this.zoomed.bind(this));
    const svg = d3.select(this.svgEl.nativeElement).call(zoom);
    this.g = svg.select('g');
    const image = this.g.select('image');
    this.width = +svg.attr('width');
    this.height = +svg.attr('height');
    this.x0 = +image.attr('x');
    this.y0 = +image.attr('y');
    this.x1 = +image.attr('width') + this.x0;
    this.y1 = +image.attr('height') + this.y0;

    // Don’t allow the zoomed area to be bigger than the viewport.
    zoom.scaleExtent([1, Math.min(this.width / (this.x1 - this.x0), this.height / (this.y1 - this.y0))]);
  }

  private zoomed() {
    const t = d3.event.transform;
    if (t.invertX(0) > this.x0) {
      t.x = -this.x0 * t.k;
    } else if (t.invertX(this.width) < this.x1) {
      t.x = this.width - this.x1 * t.k;
    }

    if (t.invertY(0) > this.y0) {
      t.y = -this.y0 * t.k;
    } else if (t.invertY(this.height) < this.y1) {
      t.y = this.height - this.y1 * t.k;
    }
    this.g.attr('transform', t);
  }

}
