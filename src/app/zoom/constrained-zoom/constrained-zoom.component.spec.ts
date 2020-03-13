import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstrainedZoomComponent } from './constrained-zoom.component';

describe('ConstrainedZoomComponent', () => {
  let component: ConstrainedZoomComponent;
  let fixture: ComponentFixture<ConstrainedZoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstrainedZoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstrainedZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
