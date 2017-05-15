/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AvamCanvasGridComponent } from './avam-canvas-grid.component';

describe('AvamCanvasGridComponent', () => {
  let component: AvamCanvasGridComponent;
  let fixture: ComponentFixture<AvamCanvasGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvamCanvasGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvamCanvasGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});