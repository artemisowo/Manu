import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { servicioauth } from '../servicio/servicioauth';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.css',
})
export class iniciar_sesion {
  email = '';
  password = '';

  cargando = false;
  error = '';
  aviso = '';
  mostrarverificacion = false;

  constructor(private auth: servicioauth, private router: Router) {}

  async iniciar() {
    this.error = '';
    this.aviso = '';
    this.mostrarverificacion = false;

    this.cargando = true;
    try {
      await this.auth.iniciarsesion(this.email, this.password);

      const ok = await this.auth.correoverificadoactual();
      if (!ok) {
        this.mostrarverificacion = true;
        this.aviso = 'Revisa tu correo para verificar tu cuenta (también Spam/Promociones).';
        return;
      }

      await this.router.navigate(['/mapa']);
    } catch (e: any) {
      this.error = e?.message ?? 'Error al iniciar sesión';
    } finally {
      this.cargando = false;
    }
  }

  async ya_verifique() {
    this.error = '';
    this.cargando = true;
    try {
      const ok = await this.auth.correoverificadoactual();
      if (ok) {
        await this.router.navigate(['/mapa']);
      } else {
        this.error = 'Aún no aparece verificado. Usa el último correo y vuelve a intentar.';
      }
    } catch (e: any) {
      this.error = e?.message ?? 'No se pudo comprobar la verificación.';
    } finally {
      this.cargando = false;
    }
  }

  async reenviar() {
    this.error = '';
    try {
      await this.auth.reenviarverificacion();
      this.aviso = 'Correo reenviado. Revisa tu Bandeja y Spam.';
    } catch (e: any) {
      this.error = e?.message ?? 'No se pudo reenviar el correo.';
    }
  }
}
