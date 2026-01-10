import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css',
})
export class Popup {
  @Output() cerrar = new EventEmitter<void>();

  // ✅ ahora enviamos datos + foto
  @Output() ingresar = new EventEmitter<{ datos: any; foto: File | null }>();

  fotoSeleccionada: File | null = null;
  nombreFoto = '';

  // ✅ para el ngModel del select estado
  estadoSeleccionado = 'Desconocido';

  // ✅ preview (si quieres mostrarla como antes)
  imagenUrl: string | null = null;

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

      // preview
      this.imagenUrl = URL.createObjectURL(this.fotoSeleccionada);
    } else {
      this.fotoSeleccionada = null;
      this.nombreFoto = '';
      this.imagenUrl = null;
    }
  }

  onIngresar(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const fd = new FormData(form);

    const datos: any = {};
    fd.forEach((valor, clave) => {
      datos[clave] = valor;
    });

    // ✅ asegurar que estado venga del ngModel aunque no lo tome el FormData como esperas
    datos.estado = this.estadoSeleccionado;

    // normalizar edad
    if (typeof datos.edad === 'string' && datos.edad.trim() !== '') {
      const n = Number(datos.edad);
      datos.edad = Number.isNaN(n) ? datos.edad : n;
    }

    this.ingresar.emit({
      datos,
      foto: this.fotoSeleccionada,
    });
  }

  // (por si aún llamas al método nuevo desde otro HTML)
  enviarFormulario(event: Event): void {
    this.onIngresar(event);
  }
}
