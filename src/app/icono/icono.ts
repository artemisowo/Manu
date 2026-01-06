import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icono.html',
  styleUrl: './icono.css'
})
export class Icono {
  @Input() menuVisible = false;
  @Input() imgUrl?: string;
  @Input() datosAnimal?: any;
  @Output() menuToggle = new EventEmitter<void>();

  onIconClick() {
    this.menuToggle.emit();
  }
}
