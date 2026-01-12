import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { servicioauth } from '../servicio/servicioauth';

@Component({
  selector: 'app-iniciar-sesion',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.css'
})
export class IniciarSesion {
  email = '';
  password = '';

  cargando = false;
  error = '';

  constructor(private auth: servicioauth, private router: Router) {}

  async iniciar() {
    this.error = '';
    this.cargando = true;
    try {
      await this.auth.iniciarSesion(this.email, this.password);
      await this.router.navigate(['/mapa']);
    } catch (e: any) {
      this.error = e?.code ?? 'Error al iniciar sesión';
    } finally {
      this.cargando = false;
    }
  }
}
