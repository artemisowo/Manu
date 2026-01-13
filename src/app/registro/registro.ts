import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { servicioauth } from '../servicio/servicioauth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class registro implements OnDestroy {
  email = '';
  numero = '';
  usuario = '';
  password = '';
  sector = '';

  cargando = false;
  error = '';
  aviso = '';

  esperandoverificacion = false;

  private intervaloverificacion: any = null;

  constructor(private auth: servicioauth, private router: Router) {}

  ngOnDestroy(): void {
    this.detenerverificacionauto();
  }

  solonumeros() {
    const limpio = (this.numero ?? '').replace(/\D/g, '');
    this.numero = limpio.slice(0, 9);
  }

  mensajepassword(pass: string): string {
    if (!pass || pass.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'Debe incluir al menos una Mayúscula.';
    if (!/[a-z]/.test(pass)) return 'Debe incluir al menos una Minúscula.';
    if (!/\d/.test(pass)) return 'Debe incluir al menos un Número.';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Debe incluir al menos un Carácter especial.';
    return '';
  }

  async registrar() {
    this.error = '';
    this.aviso = '';

    const msg = this.mensajepassword(this.password);
    if (msg) {
      this.error = msg;
      return;
    }

    this.cargando = true;
    try {
      await this.auth.registrar(this.email, this.password, this.usuario, this.numero, this.sector);

      this.esperandoverificacion = true;
      this.aviso = 'Revisa tu correo para verificar tu cuenta (también Spam/Promociones).';

      this.iniciarverificacionauto();
    } catch (e: any) {
      this.error = e?.message ?? e?.code ?? 'Error al registrar';
    } finally {
      this.cargando = false;
    }
  }

  async reenviarcorreo() {
    this.error = '';
    try {
      await this.auth.reenviarverificacion();
      this.aviso = 'Correo reenviado. Revisa tu Bandeja y Spam.';
    } catch (e: any) {
      this.error = e?.message ?? 'No se pudo reenviar el correo.';
    }
  }

  async yaverifique() {
    this.error = '';
    this.cargando = true;

    try {
      await this.auth.relogin(this.email, this.password);

      const ok = await this.auth.correoverificadoactual();
      if (ok) {
        this.detenerverificacionauto();
        await this.router.navigate(['/mapa']);
      } else {
        this.error =
          'Aún no aparece verificado. Asegúrate de abrir el enlace de verificación y vuelve a intentar.';
      }
    } catch (e: any) {
      this.error = e?.message ?? 'No se pudo comprobar la verificación.';
    } finally {
      this.cargando = false;
    }
  }

  private iniciarverificacionauto() {
    this.detenerverificacionauto();

    this.intervaloverificacion = setInterval(async () => {
      try {
        const ok = await this.auth.correoverificadoactual();
        if (ok) {
          this.detenerverificacionauto();
          await this.router.navigate(['/mapa']);
        }
      } catch {
      }
    }, 3000);
  }

  private detenerverificacionauto() {
    if (this.intervaloverificacion) {
      clearInterval(this.intervaloverificacion);
      this.intervaloverificacion = null;
    }
  }
}
