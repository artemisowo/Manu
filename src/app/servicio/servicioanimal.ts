import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  CollectionReference,
  DocumentData,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Animal {
  id?: string;

  lat: number;
  lng: number;

  nombre?: string;
  etapa?: string; 
  personalidad?: string;
  estado?: string;

  descripcion?: string;

  uidCreador?: string;
  correoCreador?: string;

  creado?: any;

  imagenUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ServicioAnimal {
  private colRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.colRef = collection(this.firestore, 'animales');
  }

  obtenerAnimales(): Observable<Animal[]> {
    return collectionData(this.colRef, { idField: 'id' }) as Observable<Animal[]>;
  }

  async agregarAnimal(animal: Animal): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) throw new Error('NO_AUTH');
    if (!user.emailVerified) throw new Error('NO_VERIFIED');

    await addDoc(this.colRef, {
      ...animal,

      descripcion: (animal.descripcion ?? '').trim(),

      edad: null,

      uidCreador: user.uid,
      correoCreador: user.email ?? '',
      creado: serverTimestamp(),
    });
  }

  async editarAnimal(id: string, data: Partial<Animal>): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) throw new Error('NO_AUTH');
    if (!user.emailVerified) throw new Error('NO_VERIFIED');

    const ref = doc(this.firestore, 'animales', id);

    await updateDoc(ref, {
      ...data,

      edad: null,

      ...(data.descripcion !== undefined
        ? { descripcion: (data.descripcion ?? '').trim() }
        : {}),
    } as any);
  }

  async eliminarAnimal(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'animales', id));
  }

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
