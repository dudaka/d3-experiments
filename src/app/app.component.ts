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

  zoomLinks = [
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
    },
    {
      title: 'Pan & Zoom Axes',
      url: '/pan-zoom-axes'
    },
    {
      title: 'Programmatic Pan+Zoom',
      url: '/programmatic-pan-zoom'
    },

  ];

  realtimeLinks = [
    {
      title: 'Realtime Chart',
      url: '/realtime-chart'
    },
    {
      title: 'Realtime Chart with Multiple Streams',
      url: '/realtime-chart-multiple-streams'
    },
  ];

  candlestickLinks = [
    {
      title: 'Candlestick Chart',
      url: '/candlestick-chart'
    }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {}
}
