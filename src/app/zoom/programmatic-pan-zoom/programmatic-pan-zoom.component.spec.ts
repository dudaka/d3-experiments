import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammaticPanZoomComponent } from './programmatic-pan-zoom.component';

describe('ProgrammaticPanZoomComponent', () => {
  let component: ProgrammaticPanZoomComponent;
  let fixture: ComponentFixture<ProgrammaticPanZoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgrammaticPanZoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgrammaticPanZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
