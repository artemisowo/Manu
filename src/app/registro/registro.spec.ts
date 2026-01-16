import { ComponentFixture, TestBed } from '@angular/core/testing';

import { registro } from './registro';

describe('Registro', () => {
  let component: registro;
  let fixture: ComponentFixture<registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [registro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(registro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
