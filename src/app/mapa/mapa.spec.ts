import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mapa } from './mapa';

describe('mapa', () => {
  let component: mapa;
  let fixture: ComponentFixture<mapa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [mapa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(mapa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
