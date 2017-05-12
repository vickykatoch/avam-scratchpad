import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvmHypergridComponent } from './avm-hypergrid.component';

describe('AvmHypergridComponent', () => {
  let component: AvmHypergridComponent;
  let fixture: ComponentFixture<AvmHypergridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvmHypergridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvmHypergridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
