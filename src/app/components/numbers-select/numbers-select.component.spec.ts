import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersSelectComponent } from './numbers-select.component';

describe('NumbersSelectComponent', () => {
  let component: NumbersSelectComponent;
  let fixture: ComponentFixture<NumbersSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumbersSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumbersSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
