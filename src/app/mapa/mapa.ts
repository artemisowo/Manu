import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { Icono } from '../icono/icono';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-mapa',
  imports: [Icono, CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class Mapa implements AfterViewInit {
  @ViewChild('mapaContenedor', { static: true }) mapaContenedor!: ElementRef;

  ngAfterViewInit() {

    //código mapa
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        const map = L.map('map').setView([40.4168, -3.7038], 13); // Ej: Madrid
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
          // Obtener la ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // marcador con icono personalizado
            const userIcon = L.icon({
              iconUrl: 'https://i.ibb.co/ds5ZDWbB/Icono.png',
              iconSize: [50, 50],
              iconAnchor: [25, 50]
            });
            L.marker([lat, lng], { icon: userIcon }).addTo(map);
            map.setView([lat, lng], 15);
          });
        }
      });
    }
  }

  iconos: { x: number; y: number }[] = [];

  agregarIcono() {
    const contenedor = this.mapaContenedor.nativeElement;
    const iconoSize = 50; // tamaño aproximado del icono
    const maxX = contenedor.clientWidth - iconoSize;
    const maxY = contenedor.clientHeight - iconoSize;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    this.iconos.push({ x, y });
    console.log('Iconos actuales:', this.iconos);
  }

}
