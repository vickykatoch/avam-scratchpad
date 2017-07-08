import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamMktComponent } from './avam-mkt.component';

describe('AvamMktComponent', () => {
  let component: AvamMktComponent;
  let fixture: ComponentFixture<AvamMktComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvamMktComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvamMktComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
