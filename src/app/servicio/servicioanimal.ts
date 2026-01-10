import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Animal {
  id?: string;
  nombre: string;
  edad?: string | number;
  personalidad?: string;
  estado?: string;
  lat: number;
  lng: number;
  // si quieres más campos, agrégalos aquí
}

@Injectable({ providedIn: 'root' })
export class ServicioAnimal {
  private firestore = inject(Firestore);
  private colRef = collection(this.firestore, 'animales'); // 👈 colección

  obtenerAnimales(): Observable<Animal[]> {
    return collectionData(this.colRef, { idField: 'id' }) as Observable<Animal[]>;
  }

  agregarAnimal(datos: any): Promise<void> {
    const animal: Animal = {
      nombre: datos?.nombre ?? datos?.name ?? 'Sin nombre',
      edad: datos?.edad ?? '',
      personalidad: datos?.personalidad ?? '',
      estado: datos?.estado ?? '',
      lat: Number(datos.lat),
      lng: Number(datos.lng),
    };

    return addDoc(this.colRef, animal).then(() => {});
  }
}
