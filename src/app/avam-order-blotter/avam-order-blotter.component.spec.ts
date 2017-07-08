import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamOrderBlotterComponent } from './avam-order-blotter.component';

describe('AvamOrderBlotterComponent', () => {
  let component: AvamOrderBlotterComponent;
  let fixture: ComponentFixture<AvamOrderBlotterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvamOrderBlotterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvamOrderBlotterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
