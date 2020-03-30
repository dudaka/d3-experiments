import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickSeriesComponent } from './candlestick-series.component';

describe('CandlestickSeriesComponent', () => {
  let component: CandlestickSeriesComponent;
  let fixture: ComponentFixture<CandlestickSeriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandlestickSeriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
