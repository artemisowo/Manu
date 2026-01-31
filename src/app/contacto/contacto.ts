import { Component } from '@angular/core';
import { ServicioContacto } from './serviciocontacto';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {

  constructor(private servicioContacto: ServicioContacto) {}

  async enviarFormulario(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    const datos = {
      nombre: (form.querySelector('#nombre') as HTMLInputElement).value,
      email: (form.querySelector('#email') as HTMLInputElement).value,
      asunto: (form.querySelector('#asunto') as HTMLInputElement).value,
      mensaje: (form.querySelector('#mensaje') as HTMLTextAreaElement).value,
    };

    try {
      await this.servicioContacto.guardarMensaje(datos);
      alert('Mensaje enviado correctamente');
      form.reset();
    } catch (e) {
      console.error(e);
      alert('No fue posible enviar el mensaje. Intenta nuevamente.');
    }
  }
}
