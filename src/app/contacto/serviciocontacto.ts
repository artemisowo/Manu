import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class ServicioContacto {
  private db = getFirestore();

  async guardarMensaje(datos: {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
  }): Promise<void> {
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? null;

    await addDoc(collection(this.db, 'contactos'), {
      nombre: (datos.nombre || '').trim(),
      email: (datos.email || '').trim().toLowerCase(),
      asunto: (datos.asunto || '').trim(),
      mensaje: (datos.mensaje || '').trim(),
      uid,
      creadoEn: serverTimestamp(),
    });
  }
}
