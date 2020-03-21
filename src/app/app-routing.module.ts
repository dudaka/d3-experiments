import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FixedZoomComponent } from './zoom/fixed-zoom/fixed-zoom.component';
import { ConstrainedZoomComponent } from './zoom/constrained-zoom/constrained-zoom.component';
import { ZoomToDomainComponent } from './zoom/zoom-to-domain/zoom-to-domain.component';
import { PanZoomAxesComponent } from './zoom/pan-zoom-axes/pan-zoom-axes.component';
import { ProgrammaticPanZoomComponent } from './zoom/programmatic-pan-zoom/programmatic-pan-zoom.component';
import { CandlestickChartComponent } from './mci/candlestick-chart/candlestick-chart.component';


const routes: Routes = [
  { path: 'fixed-zoom', component: FixedZoomComponent},
  { path: 'constrained-zoom', component: ConstrainedZoomComponent},
  { path: 'zoom-to-domain', component: ZoomToDomainComponent},
  { path: 'pan-zoom-axes', component: PanZoomAxesComponent},
  { path: 'programmatic-pan-zoom', component: ProgrammaticPanZoomComponent},
  { path: 'candlestick-chart', component: CandlestickChartComponent},
  { path: '',
    redirectTo: '/fixed-zoom',
    pathMatch: 'full'
  },
  { path: '**', component: FixedZoomComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
