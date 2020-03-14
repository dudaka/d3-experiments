import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomToDomainComponent } from './zoom-to-domain.component';

describe('ZoomToDomainComponent', () => {
  let component: ZoomToDomainComponent;
  let fixture: ComponentFixture<ZoomToDomainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoomToDomainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomToDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
