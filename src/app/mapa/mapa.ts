
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Icono } from '../icono/icono';
import { CommonModule } from '@angular/common';

// Datos de cada icono en el mapa
interface IconoData {
  lat: number;
  lng: number;
  x?: number;
  y?: number;
  imgUrl?: string;
}

@Component({
  selector: 'app-mapa',
  imports: [Icono, CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class Mapa implements AfterViewInit {
  // Se accede al contenedor del mapa en el HTML
  @ViewChild('mapaContenedor', { static: true }) mapaContenedor!: ElementRef;

  iconos: IconoData[] = [];
  menuOpenIndex: number | null = null;
  private userLat: number | null = null;
  private userLng: number | null = null;
  private mapInstance: any = null;

  // Inicialización del mapa después de que la página se haya cargado
  ngAfterViewInit() {
    if (typeof window === 'undefined') return;

    // Importar y configurar el mapa
    import('leaflet').then(L => {
      const map = L.map('map');
      this.mapInstance = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Ícono personalizado para la ubicación del usuario
      let userMarker: any = null;
      const userIcon = L.icon({
        iconUrl: 'https://i.ibb.co/N2LVThnZ/ezgif-5b8fbf84131954.gif',
        iconSize: [200, 200],
        iconAnchor: [100, 100]
      });

      // Obtener y actualizar la ubicación del usuario en tiempo real
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;
          if (userMarker) {
            userMarker.setLatLng([this.userLat, this.userLng]);
          } else {
            userMarker = L.marker([this.userLat, this.userLng], { icon: userIcon }).addTo(map);
            map.setView([this.userLat, this.userLng], 30);
          }
        });
      }

  // Actualizar posiciones de iconos al mover o hacer zoom en el mapa
  map.on('move zoom', () => this.actualizarPosicionesIconos());
    });
  }

  // Abrir explorador de archivos
  abrirExploradorArchivos(fileInput: HTMLInputElement) {
    fileInput.value = '';
    fileInput.click();
  }

  // Manejar selección de archivo y agregar icono al mapa
  alSeleccionarArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    if (input.files?.[0] && this.userLat !== null && this.userLng !== null) {
      const lector = new FileReader();
      lector.onload = (e: any) => {
        const punto = this.mapInstance?.latLngToContainerPoint([this.userLat!, this.userLng!]);
        this.iconos.push({
          lat: this.userLat!,
          lng: this.userLng!,
          x: punto?.x,
          y: punto?.y,
          imgUrl: e.target.result
        });
        this.actualizarPosicionesIconos();
      };
      lector.readAsDataURL(input.files[0]);
    }
  }
  // Actualizar posiciones de los iconos en el mapa
  private actualizarPosicionesIconos() {
    if (!this.mapInstance) return;
    this.iconos.forEach(icono => {
      const punto = this.mapInstance.latLngToContainerPoint([icono.lat, icono.lng]);
      icono.x = punto.x;
      icono.y = punto.y;
    });
  }
}
