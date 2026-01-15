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
    edad: null,
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
    this.datosAnimal = { nombre: '', edad: null, personalidad: 'Desconocido', lesiones: '' };
    this.estadoSeleccionado = 'Desconocido';
    this.fotoSeleccionada = null;
    this.imagenUrl = null;
}

  precargarEditar(animal: any): void {
    this.datosAnimal = {
      // Aseguramos que tome el nombre sin importar si viene como 'nombre' o 'name'
      nombre: animal.nombre || animal.name || '', 
      edad: animal.edad ?? null,
      personalidad: animal.personalidad ?? 'Desconocido',
      // IMPORTANTE: Tu servicio animal usa 'descripcion', pero el popup usa 'lesiones'
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
    }
  }

  
  onIngresar(event: Event): void {
    event.preventDefault();

    // 1. Creamos una copia de los datos actuales del formulario
    const datosParaEnviar = { ...this.datosAnimal };

    // 2. Lógica de limpieza según el estado seleccionado:
    if (this.estadoSeleccionado !== 'Signos de Enfermedades/Lesiones') {
      // Si NO está enfermo, enviamos la descripción/lesiones como texto vacío 
      // para que se borre del menú y de la base de datos.
      datosParaEnviar.lesiones = ''; 
    }

    // 3. Añadimos el estado actual
    const payload = {
      ...datosParaEnviar,
      estado: this.estadoSeleccionado
    };

    // 4. Emitimos hacia el componente mapa
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
