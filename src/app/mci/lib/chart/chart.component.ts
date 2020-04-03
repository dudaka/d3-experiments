import { Component, OnInit, ViewChild, Input, ContentChildren, QueryList, AfterContentInit, ElementRef } from '@angular/core';
import { chartOptionDefaults } from '../options/chart-options-defaults';
import { Subject, Subscription } from 'rxjs';
import { CandlestickSeriesComponent } from '../series/candlestick-series/candlestick-series.component';
import { select as d3Select } from 'd3-selection';
import { find } from '../utils';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[Chart]',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, AfterContentInit {

  @Input() private options: any;
  @ContentChildren(CandlestickSeriesComponent) private componentContents: QueryList<CandlestickSeriesComponent>;

  private subscription: Subscription;
  private subject = new Subject<any>();

  private props: any;
  context: any;

  constructor(private el: ElementRef) { }

  ngAfterContentInit(): void {
    this.componentContents.map(content => console.log(content));

    // d3Select(this.el.nativeElement)
    //   .attr()
  }

  ngOnInit(): void {
    this.initializeDefaultProperties();
  }

  private initializeDefaultProperties() {
    this.props = {
      ...chartOptionDefaults,
      ...this.options
    };
  }

  setSubscription(subject: Subject<any>) {
    this.subscription = subject.subscribe(message => {
      console.log(message);
      this.subject.next(message);
    });
  }

  deleteSubcription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getProps() {
    return this.props;
  }

  setContext(context: any) {
    this.context = context;

    this.render();
  }

  private render() {
    const chartConfig = find(this.context.chartConfigs, each => each.id === this.props.id);
    const { origin, id } = chartConfig;
    const { chartConfigs, ...context } = this.context;

    const [x, y] = origin as any[];

    d3Select(this.el.nativeElement)
      .attr('transform', `translate(${x}, ${y})`);

    this.componentContents.forEach(content => {
      content.setSubscription(this.subject);
      content.setContext({
        ...context,
        chartConfig,
        chartId: id
      });
    });
  }

}
