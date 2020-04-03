import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { chartOptionDefaults } from '../options/chart-options-defaults';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[Chart]',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() private options: any;

  private props: any;

  constructor() { }

  ngOnInit(): void {
    this.initializeDefaultProperties();
  }

  private initializeDefaultProperties() {
    this.props = {
      ...chartOptionDefaults,
      ...this.options
    };
  }

  getProps() {
    return this.props;
  }

}
