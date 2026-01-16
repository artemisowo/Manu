import { ComponentFixture, TestBed } from '@angular/core/testing';

import { iniciar_sesion } from './iniciar-sesion';

describe('IniciarSesion', () => {
  let component: iniciar_sesion;
  let fixture: ComponentFixture<iniciar_sesion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [iniciar_sesion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(iniciar_sesion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
