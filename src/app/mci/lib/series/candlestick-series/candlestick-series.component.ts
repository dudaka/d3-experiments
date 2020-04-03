import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { candlestickSeriesOptionsDefaults } from '../../options/candlestick-series-options-defaults';
import { Subscription, Subject } from 'rxjs';
import { GenericComponent } from '../../api/generic-component';
import { select as d3Select } from 'd3-selection';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[CandlestickSeries]',
  templateUrl: './candlestick-series.component.html',
  styleUrls: ['./candlestick-series.component.scss']
})
export class CandlestickSeriesComponent extends GenericComponent implements OnInit {

  @Input() options: any;

  // private props: any;
  // private context: any;
  // private subscription: Subscription;

  constructor(private el: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.initializeDefaultProperties();
  }

  private initializeDefaultProperties() {
    this.props = {
      ...candlestickSeriesOptionsDefaults,
      ...this.options
    };
  }

  setContext(context: any) {
    super.setContext(context);
    d3Select(this.el.nativeElement).call(this.draw, {
      drawOn: ['pan'],
    });
  }

}
