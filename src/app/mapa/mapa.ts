import { Component, AfterViewInit, OnDestroy, NgZone, ViewContainerRef } from '@angular/core';
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
  private map: any;
  private Lref: any;
  private subAnimales?: Subscription;
  private markersAnimales = new Map<string, { marker: any, componentRef: any }>();

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
    private auth: Auth,
    private viewContainerRef: ViewContainerRef
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

      // Limites del mapa a Viña del Mar
      var vinadelmarBounds = L.latLngBounds(L.latLng(-33.07, -71.60), L.latLng(-32.95, -71.45));
      this.map.setMaxBounds(vinadelmarBounds);


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

  onEditarDesdePopupAnimal(id: string): void {
    this.editarDesdePopup(id);
  }

  onEliminarDesdePopupAnimal(id: string): void {
    this.eliminarAnimal(id);
  }

  // Editar animal desde el popup
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

  // Guardar animal (crear o editar)
  async guardarAnimal(payload: { datos: any; foto: File | null; id?: string }): Promise<void> {
    const id = payload.id;

    if (id) {
      this.zone.run(() => (this.mostrarPopup = false));

      try {
        const datosEdit: any = {
          nombre: payload.datos?.nombre ?? payload.datos?.name,
          edad: payload.datos?.edad,
          personalidad: payload.datos?.personalidad,
          estado: payload.datos?.estado,
        };

        // Solo guardar descripcion si hay lesiones (estado es "Signos de Enfermedades/Lesiones")
        if (payload.datos?.estado !== 'Signos de Enfermedades/Lesiones') {
          datosEdit.descripcion = '';
        } else {
          // Si el estado es lesiones, guardamos lo que venga (o vacío si no escribió nada)
          datosEdit.descripcion = payload.datos.lesiones?.toString().trim() || '';
        }

        if (payload.foto) {
          const imagenUrl = await this.animalService.subirImagenCloudinary(payload.foto);
          datosEdit.imagenUrl = imagenUrl;
        }

        await this.animalService.editarAnimal(id, datosEdit);
        // El Observable se actualiza automáticamente, no necesitamos llamar a refrescarVista manualmente
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

      const descripcion = payload.datos?.estado === 'Signos de Enfermedades/Lesiones' 
        ? (payload.datos.lesiones?.toString().trim() || '') 
        : '';

      const animal: Animal = {
        nombre: payload.datos?.nombre ?? payload.datos?.name,
        edad: payload.datos?.edad,
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

  // Mostrar los animales en el mapa
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

      // Actualizar marcador existente
      if (this.markersAnimales.has(a.id)) {
        const objetoMarcador = this.markersAnimales.get(a.id)!;
        objetoMarcador.marker.setLatLng([(a as any).lat, (a as any).lng]);
        objetoMarcador.componentRef.instance.datosAnimal = a;
        objetoMarcador.componentRef.instance.imgUrl = fotoUrl;

        objetoMarcador.componentRef.changeDetectorRef.detectChanges();
        continue;
      }

      // Nuevo marcador en el mapa
      const marker = L.marker([(a as any).lat, (a as any).lng], {
        icon: fotoUrl ? this.iconoPersonalizado : undefined,
      }).addTo(this.map);

      // Crear un contenedor para el popup con el componente Icono
      const popupContainer = document.createElement('div');
      popupContainer.style.pointerEvents = 'auto';

      // Renderizar el componente Icono dinámicamente
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

    // Eliminar marcadores que ya no están en la lista
    for (const [id, entry] of this.markersAnimales.entries()) {
      if (!idsActuales.has(id)) {
        entry.marker.remove();
        entry.componentRef.destroy(); // <--- Añade esta línea para liberar memoria
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
