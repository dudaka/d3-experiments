import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  links = [
    {
      title: 'Fixed Zoom',
      url: '/fixed-zoom'
    },
    {
      title: 'Constrained Zoom',
      url: '/constrained-zoom'
    },
    {
      title: 'Zoom to Domain',
      url: '/zoom-to-domain'
    }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {}
}
