import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { servicioauth, perfilusuario } from '../servicio/servicioauth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class perfil {
  cargando = true;
  error = '';
  datos: perfilusuario | null = null;

  constructor(
    private authfirebase: Auth,
    private authservice: servicioauth,
    private router: Router
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.authfirebase, async (user) => {
      if (!user) {
        this.router.navigate(['/iniciarsesion']);
        return;
      }

      try {
        this.datos = await this.authservice.obtenerperfil(user.uid);
      } catch (e: any) {
        this.error = e?.message ?? 'no se pudo cargar el perfil';
      } finally {
        this.cargando = false;
      }
    });
  }

  async cerrarsesion() {
    await this.authservice.cerrarsesion();
    await this.router.navigate(['/inicio']);
  }
}
