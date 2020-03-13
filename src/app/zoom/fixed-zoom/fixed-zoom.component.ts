import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-fixed-zoom',
  templateUrl: './fixed-zoom.component.html',
  styleUrls: ['./fixed-zoom.component.scss']
})
export class FixedZoomComponent implements OnInit {

  @ViewChild('chart', { static: true}) private canvasEl: ElementRef;
  canvas: d3.Selection<any, unknown, null, undefined>;
  width: any;
  height: any;
  context: any;
  points: number[][];
  fx: number;
  fy: number;
  radius: number;

  constructor() { }

  ngOnInit(): void {
    this.canvas = d3.select(this.canvasEl.nativeElement);
    this.context = this.canvas.node().getContext('2d');
    this.width = this.canvas.property('width');
    this.height = this.canvas.property('height');
    this.radius = 2.5;

    this.points = d3.range(2000).map(this.phyllotaxis(10));
    this.fx = this.points[0][0];
    this.fy = this.points[0][1];

    const zoom = d3.zoom()
      .scaleExtent([1 / 2, 96])
      .on('zoom', this.zoomed.bind(this));

    this.canvas
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity);
  }

  private zoomed() {
    console.log(d3.event.transform.k);
    const t = d3.zoomIdentity
      .translate(this.width / 2, this.height / 2)
      .scale(d3.event.transform.k)
      .translate(-this.fx, -this.fy);

    this.context.save();
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.translate(t.x, t.y);
    this.context.scale(t.k, t.k);
    this.drawPoints();
    this.context.restore();
  }

  private drawPoints() {
    this.context.beginPath();
    this.points.forEach(this.drawPoint.bind(this));
    this.context.fill();
  }

  private drawPoint(point) {
    this.context.moveTo(point[0] + this.radius, point[1]);
    this.context.arc(point[0], point[1], this.radius, 0, 2 * Math.PI);
  }

  private phyllotaxis(radius) {
    const theta = Math.PI * (3 - Math.sqrt(5));
    return (i) => {
      const r = radius * Math.sqrt(i);
      const a = theta * i;
      return [
        this.width / 2 + r * Math.cos(a),
        this.height / 2 + r * Math.sin(a)
      ];
    };
  }

}
