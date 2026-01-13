import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Popup } from '../popup/popup';
import { ServicioAnimal, Animal } from '../servicio/servicioanimal';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, Popup],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class mapa implements AfterViewInit, OnDestroy {
  private map: any;

  logueado = false;

  private userLat: number | null = null;
  private userLng: number | null = null;

  private selectedLat: number | null = null;
  private selectedLng: number | null = null;

  mostrarPopup = false;

  private markerSeleccion: any = null;
  private subAnimales?: Subscription;

  private ignorarSiguienteClickMapa = false;
  private markersAnimales = new Map<string, any>();

  constructor(
    private animalService: ServicioAnimal,
    private zone: NgZone,
    private auth: Auth
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.logueado = !!user;
    });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      this.map = L.map('map');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      this.map.setView([-33.45, -70.66], 13);

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => {
            this.userLat = pos.coords.latitude;
            this.userLng = pos.coords.longitude;
          },
          (err) => console.error('Geolocalización:', err),
          { enableHighAccuracy: true }
        );
      }

      this.map.on('click', (e: any) => {
        if (this.ignorarSiguienteClickMapa) {
          this.ignorarSiguienteClickMapa = false;
          return;
        }

        this.selectedLat = e.latlng.lat;
        this.selectedLng = e.latlng.lng;

        const lat = this.selectedLat;
        const lng = this.selectedLng;
        if (lat === null || lng === null) return;

        if (!this.markerSeleccion) {
          this.markerSeleccion = L.marker([lat, lng], { draggable: true }).addTo(this.map);

          this.markerSeleccion.on('dragend', () => {
            const p = this.markerSeleccion.getLatLng();
            this.selectedLat = p.lat;
            this.selectedLng = p.lng;
          });
        } else {
          this.markerSeleccion.setLatLng([lat, lng]);
        }
      });

      this.subAnimales = this.animalService.obtenerAnimales().subscribe({
        next: (animales: Animal[]) => this.pintarAnimales(L, animales),
        error: (err) => console.error('Error leyendo animales:', err),
      });
    });
  }

  ngOnDestroy(): void {
    this.subAnimales?.unsubscribe();
  }

  abrirPopup(): void {
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
      alert('Selecciona un punto en el mapa antes de ingresar un animal.');
      return;
    }

    this.mostrarPopup = true;
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  async guardarAnimal(payload: { datos: any; foto: File | null }): Promise<void> {
    const lat = this.selectedLat;
    const lng = this.selectedLng;
    if (lat === null || lng === null) return;

    this.zone.run(() => (this.mostrarPopup = false));

    try {
      let imagenUrl: string | null = null;

      if (payload.foto) {
        imagenUrl = await this.animalService.subirImagenCloudinary(payload.foto);
      }

      const animal: Animal = {
        ...payload.datos,
        lat,
        lng,
        imagenUrl,
      };

      await this.animalService.agregarAnimal(animal);
    } catch (error) {
      console.error('Error guardando animal:', error);
      alert('No se pudo guardar el animal.');
      this.zone.run(() => (this.mostrarPopup = true));
    }
  }

  private pintarAnimales(L: any, animales: Animal[]): void {
    if (!this.map) return;

    const idsActuales = new Set<string>();

    for (const a of animales) {
      const id = a.id;
      if (!id) continue;

      if (typeof a.lat !== 'number' || typeof a.lng !== 'number') continue;

      idsActuales.add(id);

      const contenido = this.armarHtmlAnimal(a);

      if (this.markersAnimales.has(id)) {
        const marker = this.markersAnimales.get(id);
        marker.setLatLng([a.lat, a.lng]);
        marker.setPopupContent(contenido);
        continue;
      }

      const nombre = (a.nombre ?? 'Animal').toString();

      const iconoAnimal = L.icon({
        iconUrl: 'assets/img/marker-icon.png',
        iconRetinaUrl: 'assets/img/marker-icon-2x.png',
        shadowUrl: 'assets/img/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([a.lat, a.lng], {
        icon: iconoAnimal,
        title: nombre,
      }).addTo(this.map);

      marker.bindTooltip(nombre, {
        permanent: true,
        direction: 'top',
        offset: [0, -35],
        opacity: 1,
      });

      marker.bindPopup(contenido);

      marker.on('click', () => {
        this.ignorarSiguienteClickMapa = true;
      });

      this.markersAnimales.set(id, marker);
    }

    for (const [id, marker] of this.markersAnimales.entries()) {
      if (!idsActuales.has(id)) {
        marker.remove();
        this.markersAnimales.delete(id);
      }
    }
  }

  private armarHtmlAnimal(a: any): string {
    const nombre =
      a?.nombre ??
      a?.name ??
      a?.caracteristicas?.nombre ??
      a?.caracteristicas?.name ??
      'Desconocido';

    const edad = a?.edad ?? a?.caracteristicas?.edad ?? '—';
    const personalidad = a?.personalidad ?? a?.caracteristicas?.personalidad ?? '—';
    const estado = a?.estado ?? a?.caracteristicas?.estado ?? '—';

    const fotoUrl =
      a?.fotoUrl ??
      a?.imagenUrl ??
      a?.caracteristicas?.fotoUrl ??
      a?.caracteristicas?.imagenUrl ??
      '';

    return `
      <div style="min-width:220px;max-width:260px">
        <h3 style="margin:0 0 8px 0">${this.esc(String(nombre))}</h3>

        ${
          fotoUrl
            ? `
          <img src="${this.esc(String(fotoUrl))}"
               style="width:100%;border-radius:10px;margin:6px 0 10px 0;object-fit:cover;"
          />
        `
            : ''
        }

        <div><b>Edad:</b> ${this.esc(String(edad))}</div>
        <div><b>Personalidad:</b> ${this.esc(String(personalidad))}</div>
        <div><b>Estado:</b> ${this.esc(String(estado))}</div>
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
