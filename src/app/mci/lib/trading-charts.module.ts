import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCanvasComponent } from './chart-canvas/chart-canvas.component';
import { ChartComponent } from './chart/chart.component';
import { CandlestickSeriesComponent } from './series/candlestick-series/candlestick-series.component';


@NgModule({
  declarations: [
    ChartCanvasComponent,
    ChartComponent,
    CandlestickSeriesComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChartCanvasComponent,
    ChartComponent,
    CandlestickSeriesComponent,
  ]
})
export class TradingChartsModule { }
