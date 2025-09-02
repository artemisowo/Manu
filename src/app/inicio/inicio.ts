import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [Header, Footer],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {}
