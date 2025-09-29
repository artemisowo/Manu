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
        this.mapInstance = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        //ícono marcador de la ubicación del usuario personalizado
        let userMarker: any = null;
        const userIcon = L.icon({
          iconUrl: 'https://i.ibb.co/N2LVThnZ/ezgif-5b8fbf84131954.gif',
          iconSize: [200, 200],
          iconAnchor: [100, 100]
        });

        // Obtener la ubicación del usuario y actualizar el marcador en tiempo real
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            this.userLat = lat;
            this.userLng = lng;
            if (userMarker) {
              userMarker.setLatLng([lat, lng]);
            } else {
              userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
              map.setView([lat, lng], 30);
            }
            // Añadir ícono en la posición del usuario
            const point = map.latLngToContainerPoint([lat, lng]);
            this.iconos = [{ lat, lng, x: point.x, y: point.y }];
          });
        }

        map.on('move zoom', () => {
          this.updateIconPositions();
        });
      });
    }
  }

  iconos: { lat: number; lng: number; x?: number; y?: number }[] = [];
  menuOpenIndex: number | null = null;
  userLat: number | null = null;
  userLng: number | null = null;
  mapInstance: any = null;

  // Función para agregar ícono
  agregarIcono() {
    if (this.userLat !== null && this.userLng !== null) {
      // Agregar ícono en ubicación actual del usuario
      this.iconos.push({ lat: this.userLat, lng: this.userLng });
      this.updateIconPositions();
      console.log('Icono agregado en lat/lng:', this.userLat, this.userLng);
    } else {
      console.warn('Ubicación del usuario no disponible');
    }
  }
  // Función para actualizar posiciones de íconos
  updateIconPositions() {
    if (!this.mapInstance) return;
    this.iconos.forEach(icono => {
      const point = this.mapInstance.latLngToContainerPoint([icono.lat, icono.lng]);
      icono.x = point.x;
      icono.y = point.y;
    });
  }

}
