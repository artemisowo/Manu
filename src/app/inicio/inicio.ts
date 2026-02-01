import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  @ViewChild('contenidoPrincipal') private contenidoPrincipal!: ElementRef;

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  // Función para hacer scroll al llamar
  autoScroll(): void {
    this.contenidoPrincipal.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    this.contenidoPrincipal.nativeElement.addEventListener('touchstart', (e: TouchEvent) => {
      const element = this.contenidoPrincipal.nativeElement;
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
    });
  }

  // Click en imagen del mapa: Login o Mapa según sesión
  irSegunSesion(event: Event): void {
    event.preventDefault();

    const user = this.auth.currentUser;

    //  si está logueado y verificado -> mapa
    if (user && user.emailVerified) {
      this.router.navigate(['/mapa']);
      return;
    }

    //  si no hay sesión (o no está verificado) -> iniciar sesión
    this.router.navigate(['/iniciar_sesion']);
  }
}
