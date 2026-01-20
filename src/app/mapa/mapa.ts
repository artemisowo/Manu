import { HostListener, Component, AfterViewInit, OnDestroy, NgZone, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

import { Popup } from '../popup/popup';
import { Icono } from '../icono/icono';
import { ServicioAnimal, Animal } from '../servicio/servicioanimal';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, Popup, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class mapa implements AfterViewInit, OnDestroy {
  @ViewChild('contenedorFiltros') contenedorFiltros!: ElementRef;

  private map: any;
  private Lref: any;
  private subAnimales?: Subscription;
  private markersAnimales = new Map<string, { marker: any, componentRef: any }>();

  // ✅ bounds Viña del Mar
  private vinaBounds: any = null;

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

  // (los mantengo tal cual los tienes, aunque después los migremos a etapa)
  filtroEdadMin: number | null = null;
  filtroEdadMax: number | null = null;
  filtroSoloMios = false;
  filtroSalud: 'TODOS' | 'ENFERMO' | 'SALUDABLE' = 'TODOS';
  filtroPersonalidad: string = 'TODOS';

  constructor(
    private animalService: ServicioAnimal,
    private zone: NgZone,
    private auth: Auth,
    private viewContainerRef: ViewContainerRef
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.logueado = !!user;
      this.uidActual = user?.uid ?? null;
      this.refrescarVista();
    });
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event) {
    if (!this.mostrarFiltros) return;

    const clicDentro = this.contenedorFiltros?.nativeElement?.contains(event.target);
    if (!clicDentro) this.mostrarFiltros = false;
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      this.Lref = L;

      this.map = L.map('map', {
        center: [-33.02, -71.55],
        zoom: 15,
        minZoom: 14,
        maxZoom: 18,
      });

      // ✅ Icono selección (tu imagen)
      this.iconoPersonalizado = L.divIcon({
        className: 'icono-animal',
        iconSize: [56, 69],
        iconAnchor: [28, 69],
        popupAnchor: [-10, -34.5],
        html: '<img src="https://i.ibb.co/whYkM1BD/Icono-manu.png" alt="Icono de animal">',
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      // ✅ Bounds Viña del Mar (propiedad, para validación)
      this.vinaBounds = L.latLngBounds(
        L.latLng(-33.07, -71.60),
        L.latLng(-32.95, -71.45)
      );

      // ✅ Limitar mapa a Viña
      this.map.setMaxBounds(this.vinaBounds);
      this.map.options.maxBoundsViscosity = 1.0;

      (window as any).eliminarAnimal = (id: string) => {
        this.zone.run(() => this.eliminarAnimal(id));
      };

      (window as any).editarAnimal = (id: string) => {
        this.zone.run(() => this.editarDesdePopup(id));
      };

      // Ubicación usuario
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

      // ✅ Click: solo dentro de Viña
      this.map.on('click', (e: any) => {
        const latlng = e.latlng;

        if (this.vinaBounds && !this.vinaBounds.contains(latlng)) {
          alert('SOLO SE PUEDEN CREAR REPORTES DENTRO DE VIÑA DEL MAR.');
          return;
        }

        this.selectedLat = latlng.lat;
        this.selectedLng = latlng.lng;

        if (!this.markerSeleccion) {
          this.markerSeleccion = L.marker([latlng.lat, latlng.lng], {
            icon: this.iconoPersonalizado,
            draggable: true,
          }).addTo(this.map);

          // ✅ Drag: no permitir dejarlo fuera
          this.markerSeleccion.on('dragend', () => {
            const p = this.markerSeleccion.getLatLng();

            if (this.vinaBounds && !this.vinaBounds.contains(p)) {
              alert('EL MARCADOR NO PUEDE QUEDAR FUERA DE VIÑA DEL MAR.');

              // volver al último punto válido
              if (this.selectedLat !== null && this.selectedLng !== null) {
                this.markerSeleccion.setLatLng([this.selectedLat, this.selectedLng]);
              } else {
                this.markerSeleccion.setLatLng(this.vinaBounds.getCenter());
              }
              return;
            }

            this.selectedLat = p.lat;
            this.selectedLng = p.lng;
          });
        } else {
          this.markerSeleccion.setLatLng([latlng.lat, latlng.lng]);
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
    // si no hay selección, usar ubicación usuario SOLO si está dentro de Viña
    if (
      (this.selectedLat === null || this.selectedLng === null) &&
      this.userLat !== null &&
      this.userLng !== null &&
      this.Lref
    ) {
      const posible = this.Lref.latLng(this.userLat, this.userLng);
      if (this.vinaBounds && !this.vinaBounds.contains(posible)) {
        alert('TU UBICACIÓN ACTUAL ESTÁ FUERA DE VIÑA DEL MAR. SELECCIONA UN PUNTO DENTRO DEL MAPA.');
        return;
      }

      this.selectedLat = this.userLat;
      this.selectedLng = this.userLng;

      if (this.markerSeleccion) {
        this.markerSeleccion.setLatLng([this.selectedLat, this.selectedLng]);
      }
    }

    if (this.selectedLat === null || this.selectedLng === null) {
      alert('Selecciona un punto en el mapa antes de ingresar un animal.');
      return;
    }

    // validación final: no abrir si está fuera
    if (this.vinaBounds && this.Lref) {
      const p = this.Lref.latLng(this.selectedLat, this.selectedLng);
      if (!this.vinaBounds.contains(p)) {
        alert('SOLO SE PUEDEN CREAR REPORTES DENTRO DE VIÑA DEL MAR.');
        return;
      }
    }

    this.modopopup = 'crear';
    this.animalparaeditar = null;
    this.mostrarPopup = true;
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }

  onEditarDesdePopupAnimal(id: string): void {
    this.editarDesdePopup(id);
  }

  onEliminarDesdePopupAnimal(id: string): void {
    this.eliminarAnimal(id);
  }

  private editarDesdePopup(id: string): void {
    const entry = this.markersAnimales.get(id);
    if (entry) entry.marker.closePopup();

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

  async guardarAnimal(payload: { datos: any; foto: File | null; id?: string }): Promise<void> {
    const id = payload.id;

    // ✅ validación final de bounds (crear/editar)
    if (this.selectedLat !== null && this.selectedLng !== null && this.vinaBounds && this.Lref) {
      const p = this.Lref.latLng(this.selectedLat, this.selectedLng);
      if (!this.vinaBounds.contains(p)) {
        alert('NO SE PUEDE GUARDAR UN REPORTE FUERA DE VIÑA DEL MAR.');
        this.zone.run(() => (this.mostrarPopup = true));
        return;
      }
    }

    if (id) {
      this.zone.run(() => (this.mostrarPopup = false));

      try {
        const datosEdit: any = {
          nombre: payload.datos?.nombre ?? payload.datos?.name,
          etapa: payload.datos?.etapa,
          personalidad: payload.datos?.personalidad,
          estado: payload.datos?.estado,
        };

        if (payload.datos?.estado !== 'Signos de Enfermedades/Lesiones') {
          datosEdit.descripcion = '';
        } else {
          datosEdit.descripcion = payload.datos.lesiones?.toString().trim() || '';
        }

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

      const descripcion =
        payload.datos?.estado === 'Signos de Enfermedades/Lesiones'
          ? (payload.datos.lesiones?.toString().trim() || '')
          : '';

      const animal: Animal = {
        nombre: payload.datos?.nombre ?? payload.datos?.name,
        etapa: payload.datos?.etapa,
        personalidad: payload.datos?.personalidad,
        estado: payload.datos?.estado,
        descripcion,
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

  private pintarAnimales(L: any, animales: Animal[]): void {
    if (!this.map) return;

    const idsActuales = new Set<string>();

    for (const a of animales) {
      if (!a.id || typeof (a as any).lat !== 'number' || typeof (a as any).lng !== 'number') continue;
      idsActuales.add(a.id);

      const fotoUrl =
        (a as any)?.imagenUrl ??
        (a as any)?.fotoUrl ??
        (a as any)?.caracteristicas?.imagenUrl ??
        (a as any)?.caracteristicas?.fotoUrl ??
        '';

      if (this.markersAnimales.has(a.id)) {
        const objetoMarcador = this.markersAnimales.get(a.id)!;
        objetoMarcador.marker.setLatLng([(a as any).lat, (a as any).lng]);
        objetoMarcador.componentRef.instance.datosAnimal = a;
        objetoMarcador.componentRef.instance.imgUrl = fotoUrl;
        objetoMarcador.componentRef.changeDetectorRef.detectChanges();
        continue;
      }

      const marker = L.marker([(a as any).lat, (a as any).lng], {
        icon: fotoUrl ? this.iconoPersonalizado : undefined,
      }).addTo(this.map);

      const popupContainer = document.createElement('div');
      popupContainer.style.pointerEvents = 'auto';

      const componentRef = this.viewContainerRef.createComponent(Icono);
      componentRef.instance.datosAnimal = a;
      componentRef.instance.imgUrl = fotoUrl;

      componentRef.instance.editar.subscribe((id: string) => {
        marker.closePopup();
        this.zone.run(() => this.onEditarDesdePopupAnimal(id));
      });

      componentRef.instance.animalEliminado.subscribe((id: string) => {
        marker.remove();
        this.markersAnimales.delete(id);
      });

      popupContainer.appendChild(componentRef.location.nativeElement);
      marker.bindPopup(popupContainer, { maxWidth: 400, className: 'leaflet-popup-icono' });

      this.markersAnimales.set(a.id, { marker, componentRef });
    }

    for (const [id, entry] of this.markersAnimales.entries()) {
      if (!idsActuales.has(id)) {
        entry.marker.remove();
        entry.componentRef.destroy();
        this.markersAnimales.delete(id);
      }
    }
  }

  async eliminarAnimal(id: string) {
    try {
      await this.animalService.eliminarAnimal(id);
      const entry = this.markersAnimales.get(id);
      if (entry) {
        entry.marker.remove();
        entry.componentRef.destroy();
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
