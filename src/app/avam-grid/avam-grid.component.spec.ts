import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamGridComponent } from './avam-grid.component';

describe('AvamGridComponent', () => {
  let component: AvamGridComponent;
  let fixture: ComponentFixture<AvamGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvamGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvamGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
