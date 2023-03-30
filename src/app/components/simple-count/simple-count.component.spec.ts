import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCountComponent } from './simple-count.component';

describe('SimpleCountComponent', () => {
  let component: SimpleCountComponent;
  let fixture: ComponentFixture<SimpleCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleCountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
