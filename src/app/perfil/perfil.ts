import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { servicioauth, PerfilUsuario } from '../servicio/servicioauth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class perfil {
  cargando = true;
  error = '';
  perfil: PerfilUsuario | null = null;

  constructor(
    private authFirebase: Auth,
    private authService: servicioauth,
    private router: Router
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.authFirebase, async (user) => {
      if (!user) {
        this.router.navigate(['/iniciarsesion']);
        return;
      }

      try {
        this.perfil = await this.authService.obtenerPerfil(user.uid);
      } catch (e: any) {
        this.error = e?.message ?? 'No fue posible cargar el perfil';
      } finally {
        this.cargando = false;
      }
    });
  }

  async cerrarSesion() {
    await this.authService.cerrarSesion();
    await this.router.navigate(['/inicio']);
  }
}
