import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Mapa } from './mapa/mapa';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Mapa],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto-prueba');
}
