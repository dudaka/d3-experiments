import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FixedZoomComponent } from './zoom/fixed-zoom/fixed-zoom.component';
import { ConstrainedZoomComponent } from './zoom/constrained-zoom/constrained-zoom.component';
import { ZoomToDomainComponent } from './zoom/zoom-to-domain/zoom-to-domain.component';
import { PanZoomAxesComponent } from './zoom/pan-zoom-axes/pan-zoom-axes.component';


const routes: Routes = [
  { path: 'fixed-zoom', component: FixedZoomComponent},
  { path: 'constrained-zoom', component: ConstrainedZoomComponent},
  { path: 'zoom-to-domain', component: ZoomToDomainComponent},
  { path: 'pan-zoom-axes', component: PanZoomAxesComponent},
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
