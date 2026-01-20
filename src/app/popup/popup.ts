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

  datosAnimal: any = {
    nombre: '',
    etapa: 'Desconocido',
    personalidad: 'Desconocido',
    lesiones: ''
  };

  fotoSeleccionada: File | null = null;
  nombreFoto = '';

  estadoSeleccionado = 'Desconocido';

  imagenUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.modo === 'editar' && this.animal) {
        this.precargarEditar(this.animal);
      } else {
        this.prepararCrear();
      }
    }

    if (this.visible && (changes['animal'] || changes['modo'])) {
      if (this.modo === 'editar' && this.animal) this.precargarEditar(this.animal);
      if (this.modo === 'crear') this.prepararCrear();
    }
  }

  prepararCrear(): void {
    this.datosAnimal = {
      nombre: '',
      etapa: 'Desconocido',
      personalidad: 'Desconocido',
      lesiones: ''
    };
    this.estadoSeleccionado = 'Desconocido';
    this.fotoSeleccionada = null;
    this.imagenUrl = null;
  }

  precargarEditar(animal: any): void {
    this.datosAnimal = {
      nombre: animal.nombre || animal.name || '',
      etapa: animal.etapa ?? 'Desconocido',
      personalidad: animal.personalidad ?? 'Desconocido',
      lesiones: animal.descripcion || animal.lesiones || ''
    };

    this.estadoSeleccionado = animal.estado ?? 'Desconocido';
    this.imagenUrl = animal.imagenUrl ?? null;
    this.fotoSeleccionada = null;
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
      this.imagenUrl = null;
    }
  }

  /* ============================
     VALIDACIÓN NOMBRE
     ============================ */
  soloLetrasNombre(): void {
    if (this.datosAnimal?.nombre == null) return;

    const valorOriginal = String(this.datosAnimal.nombre);

    const valorLimpio = valorOriginal
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
      .replace(/\s{2,}/g, ' ');

    if (valorOriginal !== valorLimpio) {
      alert('EL NOMBRE SOLO PUEDE CONTENER LETRAS.');
    }

    this.datosAnimal.nombre = valorLimpio;
  }

  onIngresar(event: Event): void {
    event.preventDefault();

    /* VALIDAR NOMBRE ANTES DE GUARDAR */
    const nombre = (this.datosAnimal?.nombre || '').trim();

    if (nombre && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      alert('EL NOMBRE SOLO PUEDE CONTENER LETRAS.');
      return;
    }

    // normalizar nombre
    this.datosAnimal.nombre = nombre.replace(/\s{2,}/g, ' ');

    // 1. Copia segura de los datos
    const datosParaEnviar = { ...this.datosAnimal };

    // 2. Limpiar lesiones si no corresponde
    if (this.estadoSeleccionado !== 'Signos de Enfermedades/Lesiones') {
      datosParaEnviar.lesiones = '';
    }

    // 3. Payload final
    const payload = {
      ...datosParaEnviar,
      estado: this.estadoSeleccionado
    };

    // 4. Emitir al mapa
    this.ingresar.emit({
      datos: payload,
      foto: this.fotoSeleccionada,
      id: this.modo === 'editar' ? this.animal?.id : undefined,
    });
  }

  enviarFormulario(event: Event): void {
    this.onIngresar(event);
  }
}
