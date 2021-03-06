import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { FixedZoomComponent } from './zoom/fixed-zoom/fixed-zoom.component';
import { ConstrainedZoomComponent } from './zoom/constrained-zoom/constrained-zoom.component';
import { ZoomToDomainComponent } from './zoom/zoom-to-domain/zoom-to-domain.component';
import { PanZoomAxesComponent } from './zoom/pan-zoom-axes/pan-zoom-axes.component';
import { ProgrammaticPanZoomComponent } from './zoom/programmatic-pan-zoom/programmatic-pan-zoom.component';
import { RealTimeChartComponent } from './real-time/real-time-chart/real-time-chart.component';
import { TradingChartsModule } from './mci/lib/trading-charts.module';
import { CandlestickChartComponent } from './mci/charts/candlestick-chart/candlestick-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    FixedZoomComponent,
    ConstrainedZoomComponent,
    ZoomToDomainComponent,
    PanZoomAxesComponent,
    ProgrammaticPanZoomComponent,
    RealTimeChartComponent,
    CandlestickChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    TradingChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
