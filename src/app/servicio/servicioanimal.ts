import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Animal {
  id?: string;
  nombre?: string;
  edad?: number;
  personalidad?: string;
  estado?: string;
  lat?: number;
  lng?: number;
  imagenUrl?: string | null;
  creadoEn?: number;
}

@Injectable({ providedIn: 'root' })
export class ServicioAnimal {
  private firestore = inject(Firestore);

  private colAnimales = collection(this.firestore, 'animales');

  obtenerAnimales(): Observable<Animal[]> {
    return collectionData(this.colAnimales, { idField: 'id' }) as Observable<Animal[]>;
  }

  agregarAnimal(animal: Animal) {
    return addDoc(this.colAnimales, {
      ...animal,
      creadoEn: Date.now(),
    });
  }
}
