import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  @ViewChild('contenidoPrincipal') private contenidoPrincipal!: ElementRef;

  // Función para hacer scroll al llamar
  autoScroll(): void {
    this.contenidoPrincipal.nativeElement.scrollIntoView({
      behavior: 'smooth', 
      block: 'start'      
    });
  }
}
