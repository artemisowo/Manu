import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  docData,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Animal {
  id?: string;

  // ubicación
  lat: number;
  lng: number;

  // datos del animal
  nombre?: string;
  edad?: number | string;
  personalidad?: string;
  estado?: string;

  // url imagen (Cloudinary)
  imagenUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ServicioAnimal {
  private colRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.colRef = collection(this.firestore, 'animales');
  }

  obtenerAnimales(): Observable<Animal[]> {
    return collectionData(this.colRef, { idField: 'id' }) as Observable<Animal[]>;
  }

  async agregarAnimal(animal: Animal): Promise<void> {
    await addDoc(this.colRef, animal);
  }

  // ✅ Cloudinary (sin backend) - devuelve URL pública
  async subirImagenCloudinary(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'Manu_Animales');

    const res = await fetch('https://api.cloudinary.com/v1_1/doqwqe2l2/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const texto = await res.text();
      throw new Error('Cloudinary error: ' + texto);
    }

    const data = await res.json();
    if (!data?.secure_url) {
      throw new Error('Cloudinary no devolvió secure_url');
    }

    return data.secure_url as string;
  }
}
