import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Popup } from '../popup/popup';
import { ServicioAnimal, Animal } from '../servicio/servicioanimal';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, Popup],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
  providers: [ServicioAnimal],
})
export class mapa implements AfterViewInit, OnDestroy {
  private animalService = inject(ServicioAnimal);

  private map: any;

  private userLat: number | null = null;
  private userLng: number | null = null;

  private selectedLat: number | null = null;
  private selectedLng: number | null = null;

  mostrarPopup = false;

  private markerSeleccion: any = null;
  private markersAnimales = new Map<string, any>();
  private subAnimales?: Subscription;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      this.map = L.map('map', { zoomControl: true, attributionControl: true });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      // centro inicial fijo
      this.map.setView([-33.45, -70.66], 13);

      // ubicación del usuario
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            this.userLat = position.coords.latitude;
            this.userLng = position.coords.longitude;

            // Solo centra si aún no se eligió ubicación manual
            if (this.selectedLat === null && this.selectedLng === null) {
              const lat = this.userLat;
              const lng = this.userLng;
              if (lat !== null && lng !== null) {
                this.map.setView([lat, lng], 17);
              }
            }
          },
          (err: GeolocationPositionError) => console.error('Error geolocalización:', err),
          { enableHighAccuracy: true }
        );
      }

      // Click para elegir ubicación
      this.map.on('click', (e: any) => {
        this.selectedLat = e.latlng.lat;
        this.selectedLng = e.latlng.lng;

        const lat = this.selectedLat;
        const lng = this.selectedLng;
        if (lat === null || lng === null) return;

        if (!this.markerSeleccion) {
          this.markerSeleccion = L.marker([lat, lng], { draggable: true }).addTo(this.map);

          this.markerSeleccion.on('dragend', () => {
            const pos = this.markerSeleccion.getLatLng();
            this.selectedLat = pos.lat;
            this.selectedLng = pos.lng;
          });
        } else {
          this.markerSeleccion.setLatLng([lat, lng]);
        }
      });

      // escuchar animales (Animal[])
      this.subAnimales = this.animalService.obtenerAnimales().subscribe({
        next: (animales: Animal[]) => this.pintarAnimales(L, animales),
        error: (error: unknown) => console.error('Error leyendo animales:', error),
      });
    });
  }

  ngOnDestroy(): void {
    this.subAnimales?.unsubscribe();
  }

  abrirPopup(): void {
    // si no hay selección, intenta usar la ubicación del usuario
    if (
      (this.selectedLat === null || this.selectedLng === null) &&
      this.userLat !== null &&
      this.userLng !== null
    ) {
      this.selectedLat = this.userLat;
      this.selectedLng = this.userLng;
    }

    const lat = this.selectedLat;
    const lng = this.selectedLng;

    if (lat === null || lng === null) {
      alert('Primero selecciona en el mapa el lugar donde viste al animal (clic en el mapa).');
      return;
    }

    this.mostrarPopup = true;
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  async guardarAnimal(datos: any): Promise<void> {
  const lat = this.selectedLat;
  const lng = this.selectedLng;

  if (lat === null || lng === null) return;

  try {
    const animal = {
      ...datos,
      lat,
      lng,
    };

    await this.animalService.agregarAnimal(animal); // ✅ ahora solo 1 argumento
    this.mostrarPopup = false;
  } catch (error: unknown) {
    console.error('Error guardando animal:', error);
    alert('No se pudo guardar. Revisa reglas de Firestore o conexión.');
  }
}


  private pintarAnimales(L: any, animales: Animal[]): void {
    if (!this.map) return;

    // limpiar marcadores eliminados
    const idsActuales = new Set(animales.map((a) => a.id).filter(Boolean) as string[]);
    for (const [id, marker] of this.markersAnimales.entries()) {
      if (!idsActuales.has(id)) {
        marker.remove();
        this.markersAnimales.delete(id);
      }
    }

    // dibujar / actualizar
    for (const animal of animales) {
      if (!animal.id) continue;

      const html = this.armarHtmlAnimal(animal);

      if (this.markersAnimales.has(animal.id)) {
        const m = this.markersAnimales.get(animal.id);
        m.setLatLng([animal.lat, animal.lng]);
        m.setPopupContent(html);
      } else {
        const m = L.marker([animal.lat, animal.lng]).addTo(this.map);
        m.bindPopup(html);
        this.markersAnimales.set(animal.id, m);
      }
    }
  }

  private armarHtmlAnimal(animal: Animal): string {
    // Evito "caracteristicas" porque no sabemos si existe en tu interfaz
    const nombre = (animal as any).nombre ?? (animal as any).name ?? 'Desconocido';
    const edad = (animal as any).edad ?? '???';
    const personalidad = (animal as any).personalidad ?? 'Se desconoce';
    const estado = (animal as any).estado ?? 'Se desconoce';

    return `
      <div style="min-width:200px">
        <h3 style="margin:0 0 8px 0">Animal: ${this.esc(String(nombre))}</h3>
        <div><b>Edad:</b> ${this.esc(String(edad))}</div>
        <div><b>Personalidad:</b> ${this.esc(String(personalidad))}</div>
        <div><b>Estado de salud:</b> ${this.esc(String(estado))}</div>
      </div>
    `;
  }

  private esc(texto: string): string {
    return texto
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
