import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css',
})
export class Popup implements OnChanges {

  @Input() visible = false;
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() animal: any = null;
  @Input() ubicacion: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() ingresar = new EventEmitter<{ datos: any; foto: File | null; id?: string }>();

  fotoSeleccionada: File | null = null;
  nombreFoto = '';

  estadoSeleccionado = 'Desconocido';

  imagenUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.modo === 'editar' && this.animal) {
        this.precargarEditar(this.animal);
      } else {
        this.prepararCrear(this.ubicacion);
      }
    }

    if (this.visible && (changes['animal'] || changes['modo'])) {
      if (this.modo === 'editar' && this.animal) this.precargarEditar(this.animal);
      if (this.modo === 'crear') this.prepararCrear(this.ubicacion);
    }
  }

  prepararCrear(ubicacion: any): void {
    this.fotoSeleccionada = null;
    this.nombreFoto = '';
    this.imagenUrl = null;

    this.estadoSeleccionado = 'Desconocido';

    const form = document.querySelector('form');
    if (form) form.reset();
  }

  precargarEditar(animal: any): void {
    this.fotoSeleccionada = null;
    this.nombreFoto = '';
    this.imagenUrl = animal.imagenUrl ?? null;

    this.estadoSeleccionado = animal.estado ?? 'Desconocido';

    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement | null;
      if (!form) return;

      Object.keys(animal).forEach(k => {
        const input = form.querySelector(`[name="${k}"]`) as HTMLInputElement | null;
        if (input && animal[k] !== undefined && animal[k] !== null) {
          input.value = animal[k];
        }
      });
    });
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  cerrarPopup(): void {
    this.cerrar.emit();
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.fotoSeleccionada = input.files[0];
      this.nombreFoto = this.fotoSeleccionada.name;
      this.imagenUrl = URL.createObjectURL(this.fotoSeleccionada);
    } else {
      this.fotoSeleccionada = null;
      this.nombreFoto = '';
    }
  }

  onIngresar(event: Event): void {
    event.preventDefault();

    if (this.modo === 'crear' && !this.fotoSeleccionada) return;

    const form = event.target as HTMLFormElement;
    const fd = new FormData(form);

    const datos: any = {};
    fd.forEach((valor, clave) => {
      datos[clave] = valor;
    });

    datos.estado = this.estadoSeleccionado;

    if (typeof datos.edad === 'string' && datos.edad.trim() !== '') {
      const n = Number(datos.edad);
      datos.edad = Number.isNaN(n) ? datos.edad : n;
    }

    if (this.ubicacion) {
      datos.lat = this.ubicacion.lat;
      datos.lng = this.ubicacion.lng;
    }

    this.ingresar.emit({
      datos,
      foto: this.fotoSeleccionada,
      id: this.modo === 'editar' ? this.animal?.id : undefined,
    });
  }

  enviarFormulario(event: Event): void {
    this.onIngresar(event);
  }
}
