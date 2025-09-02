import { Component } from '@angular/core';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-contacto',
  imports: [Header, Footer],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {

}
