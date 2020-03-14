import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanZoomAxesComponent } from './pan-zoom-axes.component';

describe('PanZoomAxesComponent', () => {
  let component: PanZoomAxesComponent;
  let fixture: ComponentFixture<PanZoomAxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanZoomAxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanZoomAxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
