import { Component, OnInit } from '@angular/core';
import { MapComponent, MarkerComponent } from '@maplibre/ngx-maplibre-gl';

@Component({
  selector: 'app-mapa',
  imports: [MapComponent, MarkerComponent],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class Mapa implements OnInit {
  userLocation: [number, number] = [-74.5, 40]; // valor por defecto (NY)
  zoom = 14; // nivel inicial de zoom

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.userLocation = [pos.coords.longitude, pos.coords.latitude];
        this.zoom = 14;
      });
    }
  }
}
