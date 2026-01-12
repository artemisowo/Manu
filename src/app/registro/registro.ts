import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { servicioauth } from '../servicio/servicioauth';

@Component({
  selector: 'app-registro',
  imports: [CommonModule,FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  soloNumeros() {
  this.numero = (this.numero ?? '').replace(/\D/g, '');
}
  email = '';
  numero = '';
  usuario = '';
  password = '';
  sector = '';

  cargando = false;
  error = '';

  constructor(private auth: servicioauth, private router: Router) {}

  async registrar() {
    this.error = '';
    this.cargando = true;
    try {
      await this.auth.registrar(this.email, this.password, this.usuario, this.numero, this.sector);
      await this.router.navigate(['/mapa']);
    } catch (e: any) {
      this.error = e?.code ?? 'Error al registrar';
    } finally {
      this.cargando = false;
    }
  }
}
