import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

import { Popup } from '../popup/popup';
import { ServicioAnimal, Animal } from '../servicio/servicioanimal';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, Popup, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class mapa implements AfterViewInit, OnDestroy {
  private map: any;
  private Lref: any;
  private subAnimales?: Subscription;
  private markersAnimales = new Map<string, any>();

  animalesCache: Animal[] = [];

  logueado = false;
  uidActual: string | null = null;

  private userLat: number | null = null;
  private userLng: number | null = null;

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  mostrarPopup = false;
  private markerSeleccion: any = null;
  private iconoPersonalizado: any = null;

  modopopup: 'crear' | 'editar' = 'crear';
  animalparaeditar: any = null;

  mostrarFiltros = false;

  filtroEdadMin: number | null = null;
  filtroEdadMax: number | null = null;
  filtroSoloMios = false;
  filtroSalud: 'TODOS' | 'ENFERMO' | 'SALUDABLE' = 'TODOS';
  filtroPersonalidad: string = 'TODOS';

  constructor(
    private animalService: ServicioAnimal,
    private zone: NgZone,
    private auth: Auth
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.logueado = !!user;
      this.uidActual = user?.uid ?? null;
      this.refrescarVista();
    });
  }

  // Inicialización del mapa
  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      this.Lref = L;
      this.map = L.map('map');

      // Marcador en el mapa personalzado
      this.iconoPersonalizado = L.divIcon({
        className: 'icono-animal',
        iconSize: [37, 46],
        iconAnchor: [37, 92],
        popupAnchor: [0, -42],
        html: '<img src="https://i.ibb.co/ds5ZDWbB/Icono.png" alt="Icono de animal">'
      });

      // Url del mapa utilizado
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      // Centro inicial del mapa
      this.map.setView([-33.02, -71.55], 15);

      (window as any).eliminarAnimal = (id: string) => {
        this.zone.run(() => this.eliminarAnimal(id));
      };

      (window as any).editarAnimal = (id: string) => {
        this.zone.run(() => this.editarDesdePopup(id));
      };

      // Obtener ubicación del usuario
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

      // Manejar clics en el mapa para seleccionar ubicación del animal
      this.map.on('click', (e: any) => {
        this.selectedLat = e.latlng.lat;
        this.selectedLng = e.latlng.lng;

        // Crear o mover marcador de selección
        if (!this.markerSeleccion) {
          this.markerSeleccion = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: this.iconoPersonalizado,
            draggable: true,
          }).addTo(this.map);

          this.markerSeleccion.on('dragend', () => {
            const p = this.markerSeleccion.getLatLng();
            this.selectedLat = p.lat;
            this.selectedLng = p.lng;
          });
        } else {
          this.markerSeleccion.setLatLng([e.latlng.lat, e.latlng.lng]);
        }
      });

      // Cargar animales
      this.subAnimales = this.animalService.obtenerAnimales().subscribe({
        next: (animales: Animal[]) => {
          this.animalesCache = animales;
          this.refrescarVista();
        },
        error: (err) => console.error('Error leyendo animales:', err),
      });
    });
  }

  ngOnDestroy(): void {
    this.subAnimales?.unsubscribe();
  }

  onCambiarFiltros(): void {
    this.refrescarVista();
  }

  limpiarFiltros(): void {
    this.filtroEdadMin = null;
    this.filtroEdadMax = null;
    this.filtroSoloMios = false;
    this.filtroSalud = 'TODOS';
    this.filtroPersonalidad = 'TODOS';
    this.refrescarVista();
  }

  private refrescarVista(): void {
    if (!this.Lref) return;
    const lista = this.filtrarAnimales(this.animalesCache);
    this.pintarAnimales(this.Lref, lista);
  }

  private filtrarAnimales(animales: Animal[]): Animal[] {
    let lista = [...animales];

    if (this.filtroSoloMios) {
      if (!this.uidActual) return [];
      lista = lista.filter((a: any) => a?.uidCreador === this.uidActual);
    }

    const min = this.filtroEdadMin !== null && this.filtroEdadMin !== undefined ? Number(this.filtroEdadMin) : null;
    const max = this.filtroEdadMax !== null && this.filtroEdadMax !== undefined ? Number(this.filtroEdadMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      lista = lista.filter((a: any) => {
        const e = this.obtenerEdadNumero(a?.edad);
        return e === null ? false : e >= min;
      });
    }

    if (max !== null && !Number.isNaN(max)) {
      lista = lista.filter((a: any) => {
        const e = this.obtenerEdadNumero(a?.edad);
        return e === null ? false : e <= max;
      });
    }

    if (this.filtroSalud !== 'TODOS') {
      lista = lista.filter((a: any) => {
        const desc = String(a?.descripcion ?? a?.lesiones ?? '').trim();
        const esEnfermo = desc.length > 0;
        return this.filtroSalud === 'ENFERMO' ? esEnfermo : !esEnfermo;
      });
    }

    if (this.filtroPersonalidad !== 'TODOS') {
      lista = lista.filter((a: any) => String(a?.personalidad ?? '') === this.filtroPersonalidad);
    }

    return lista;
  }

  private obtenerEdadNumero(edad: any): number | null {
    if (edad === null || edad === undefined) return null;
    if (typeof edad === 'number') return Number.isFinite(edad) ? edad : null;
    const t = String(edad).trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isNaN(n) ? null : n;
  }

  abrirPopup(): void {
    if (
      (this.selectedLat === null || this.selectedLng === null) &&
      this.userLat !== null &&
      this.userLng !== null
    ) {
      this.selectedLat = this.userLat;
      this.selectedLng = this.userLng;

      if (this.markerSeleccion && this.Lref) {
        this.markerSeleccion.setLatLng([this.selectedLat, this.selectedLng]);
      }
    }

    if (this.selectedLat === null || this.selectedLng === null) {
      alert('Selecciona un punto en el mapa antes de ingresar un animal.');
      return;
    }

    this.modopopup = 'crear';
    this.animalparaeditar = null;
    this.mostrarPopup = true;
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  // Editar animal desde el popup
  private editarDesdePopup(id: string): void {
    const marker = this.markersAnimales.get(id);
    if (marker) marker.closePopup();

    const a = this.animalesCache.find((x) => x.id === id);

    this.modopopup = 'editar';
    this.animalparaeditar = a ? { ...a } : { id };

    if (a?.lat != null && a?.lng != null) {
      this.selectedLat = a.lat;
      this.selectedLng = a.lng;

      if (this.markerSeleccion && this.Lref) {
        this.markerSeleccion.setLatLng([this.selectedLat, this.selectedLng]);
      }
    }

    this.mostrarPopup = true;
  }

  // Guardar animal (crear o editar)
  async guardarAnimal(payload: { datos: any; foto: File | null; id?: string }): Promise<void> {
    const id = payload.id;

    if (id) {
      this.zone.run(() => (this.mostrarPopup = false));

      try {
        const datosEdit: any = {
          ...payload.datos,
          descripcion: (payload.datos?.descripcion ?? payload.datos?.lesiones ?? '').toString().trim(),
        };

        if (payload.foto) {
          const imagenUrl = await this.animalService.subirImagenCloudinary(payload.foto);
          datosEdit.imagenUrl = imagenUrl;
        }

        await this.animalService.editarAnimal(id, datosEdit);
      } catch {
        alert('No se pudo editar el animal');
        this.zone.run(() => (this.mostrarPopup = true));
      }

      return;
    }

    const lat = this.selectedLat;
    const lng = this.selectedLng;
    if (lat === null || lng === null) return;

    if (!payload.foto) {
      alert('LA FOTO ES OBLIGATORIA');
      this.zone.run(() => (this.mostrarPopup = true));
      return;
    }

    this.zone.run(() => (this.mostrarPopup = false));

    try {
      const imagenUrl = await this.animalService.subirImagenCloudinary(payload.foto);

      const animal: Animal = {
        ...payload.datos,
        descripcion: (payload.datos?.descripcion ?? payload.datos?.lesiones ?? '').toString().trim(),
        lat,
        lng,
        imagenUrl,
      };

      await this.animalService.agregarAnimal(animal);
    } catch {
      alert('No se pudo guardar el animal');
      this.zone.run(() => (this.mostrarPopup = true));
    }
  }

  // Mostrar los animales en el mapa
  private pintarAnimales(L: any, animales: Animal[]): void {
    if (!this.map) return;

    const idsActuales = new Set<string>();

    for (const a of animales) {
      if (!a.id || typeof (a as any).lat !== 'number' || typeof (a as any).lng !== 'number') continue;
      idsActuales.add(a.id);

      const contenidoPopup = this.armarHtmlAnimal(a);

      const fotoUrl =
        (a as any)?.imagenUrl ??
        (a as any)?.fotoUrl ??
        (a as any)?.caracteristicas?.imagenUrl ??
        (a as any)?.caracteristicas?.fotoUrl ??
        '';

      // Actualizar marcador existente
      if (this.markersAnimales.has(a.id)) {
        const m = this.markersAnimales.get(a.id);
        m.setLatLng([(a as any).lat, (a as any).lng]);
        m.setPopupContent(contenidoPopup);

        continue;
      }

      // Nuevo marcador en el mapa
      const marker = L.marker([(a as any).lat, (a as any).lng], {
        icon: fotoUrl ? this.iconoPersonalizado : undefined,
      }).addTo(this.map);

      marker.bindPopup(contenidoPopup);
      this.markersAnimales.set(a.id, marker);
    }

    // Eliminar marcadores que ya no están en la lista
    for (const [id, marker] of this.markersAnimales.entries()) {
      if (!idsActuales.has(id)) {
        marker.remove();
        this.markersAnimales.delete(id);
      }
    }
  }

private crearIconoFoto(L: any, fotoUrl: string): any {
  const url = this.esc(fotoUrl);

  return L.divIcon({
    className: 'icono-foto-animal-mini-32',
    html: `<img src="${url}" class="icono-foto-mini" />`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}




private armarHtmlAnimal(a: any): string {
  const nombre =
    a?.nombre ??
    a?.name ??
    a?.caracteristicas?.nombre ??
    a?.caracteristicas?.name ??
    'Desconocido';

  const edad = a?.edad ?? '—';
  const personalidad = a?.personalidad ?? '—';

  const descripcionRaw =
    a?.descripcion ??
    a?.lesiones ??
    a?.caracteristicas?.descripcion ??
    a?.caracteristicas?.lesiones ??
    '';

  const descripcion = String(descripcionRaw).trim() || '—';

  const fotoUrl =
    a?.imagenUrl ??
    a?.fotoUrl ??
    a?.caracteristicas?.imagenUrl ??
    a?.caracteristicas?.fotoUrl ??
    '';

  const esDuenio = this.uidActual && a?.uidCreador === this.uidActual;

  return `
    <div class="popup-animal">
      <h3 class="popup-animal-titulo">${this.esc(String(nombre))}</h3>

      ${
        fotoUrl
          ? `<img src="${this.esc(String(fotoUrl))}" class="popup-animal-img" />`
          : ''
      }

      <div class="popup-animal-linea"><b>Edad:</b> ${this.esc(String(edad))}</div>
      <div class="popup-animal-linea"><b>Personalidad:</b> ${this.esc(String(personalidad))}</div>
      <div class="popup-animal-linea"><b>Enfermedad/Lesión:</b> ${this.esc(String(descripcion))}</div>

      ${
        esDuenio
          ? `
        <button class="popup-animal-btn popup-animal-btn-editar" onclick="window.editarAnimal('${a.id}')">
          EDITAR
        </button>

        <button class="popup-animal-btn popup-animal-btn-eliminar" onclick="window.eliminarAnimal('${a.id}')">
          ELIMINAR
        </button>
      `
          : ''
      }
    </div>
  `;
}


  async eliminarAnimal(id: string) {
    try {
      await this.animalService.eliminarAnimal(id);
      const marker = this.markersAnimales.get(id);
      if (marker) {
        marker.remove();
        this.markersAnimales.delete(id);
      }
    } catch {
      alert('No se pudo eliminar el animal');
    }
  }

  private esc(t: string): string {
    return t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
