import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class recuperar {
  correo = '';
  cargando = false;
  mensaje = '';
  error = '';

  constructor(private router: Router) {}

  async enviar() {
    this.mensaje = '';
    this.error = '';

    const email = (this.correo || '').trim();

    if (!email) {
      this.error = 'DEBES INGRESAR TU CORREO.';
      return;
    }

    this.cargando = true;
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      this.mensaje = 'TE ENVIAMOS UN CORREO PARA RECUPERAR TU CONTRASEÑA.';
      // opcional: volver al login después de unos segundos
      // setTimeout(() => this.router.navigate(['/iniciar-sesion']), 2000);
    } catch (e: any) {
      const code = e?.code || '';

      if (code === 'auth/user-not-found') {
        this.error = 'NO EXISTE UNA CUENTA CON ESE CORREO.';
      } else if (code === 'auth/invalid-email') {
        this.error = 'EL CORREO NO ES VÁLIDO.';
      } else if (code === 'auth/too-many-requests') {
        this.error = 'DEMASIADOS INTENTOS. INTENTA MÁS TARDE.';
      } else {
        this.error = 'NO SE PUDO ENVIAR EL CORREO. INTENTA DE NUEVO.';
      }
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }
}
