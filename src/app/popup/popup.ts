import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup',
  imports: [CommonModule, FormsModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  @Input() imagenUrl: string | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() ingresar = new EventEmitter<any>();

  estadoSeleccionado: string = 'Desconocido';

  onCerrar() {
    this.cerrar.emit();
  }

  onIngresar(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const datos: any = {};
    formData.forEach((valor, clave) => {
      if (datos[clave]) {
        if (!Array.isArray(datos[clave])) datos[clave] = [datos[clave]];
        datos[clave].push(valor);
      } else {
        datos[clave] = valor;
      }
    });

    // aseguro que el estado se guarde
    datos.estado = this.estadoSeleccionado;

    this.ingresar.emit(datos);
  }
}
