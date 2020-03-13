import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedZoomComponent } from './fixed-zoom.component';

describe('FixedZoomComponent', () => {
  let component: FixedZoomComponent;
  let fixture: ComponentFixture<FixedZoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedZoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
