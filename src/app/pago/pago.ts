import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type TipoDonacion = 'mensual' | 'unica';

@Component({
  selector: 'app-pago',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago.html',
  styleUrl: './pago.css'
})
export class Pago {

  // LINKS DE DONACIÓN (cuando sepan cual sera la cuenta a usar, pegan los links de pago aca)
  // (igual varia dependiendo del banco, cuando ya sepan cual es me avisan aunque haya terminado la practica)

  private links: Record<TipoDonacion, Record<number, string>> = {
    mensual: {
      1000: 'https://TU_LINK_MENSUAL',
      3000: 'https://TU_LINK_MENSUAL',
      5000: 'https://TU_LINK_MENSUAL',
      10000: 'https://TU_LINK_MENSUAL'
    },
    unica: {
      1000: 'https://TU_LINK_UNICA',
      3000: 'https://TU_LINK_UNICA',
      5000: 'https://TU_LINK_UNICA',
      10000: 'https://TU_LINK_UNICA'
    }
  };

  donar(tipo: TipoDonacion, monto: number): void {
    const link = this.links[tipo][monto];

    if (!link) {
      alert('DONACIÓN NO DISPONIBLE');
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
  }
}
