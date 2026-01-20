import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-donaciones',
  imports: [CommonModule, RouterLink],
  templateUrl: './donaciones.html',
  styleUrl: './donaciones.css'
})
export class Donaciones {}
