import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type PerfilUsuario = {
  uid: string;
  email: string;
  usuario: string;
  numero: string;
  sector: string;
  creadoEn: number;
};

@Injectable({ providedIn: 'root' })
export class servicioauth {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async registrar(email: string, password: string, usuario: string, numero: string, sector: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // nombre visible en Auth (opcional)
    await updateProfile(cred.user, { displayName: usuario });

    // perfil en Firestore
    await this.crearPerfil(cred.user, { usuario, numero, sector });

    return cred.user;
  }

  async iniciarSesion(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async cerrarSesion() {
    await signOut(this.auth);
  }

  async obtenerPerfil(uid: string) {
    const ref = doc(this.firestore, 'usuarios', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as PerfilUsuario) : null;
  }

  private async crearPerfil(user: User, data: { usuario: string; numero: string; sector: string }) {
    const ref = doc(this.firestore, 'usuarios', user.uid);
    const perfil: PerfilUsuario = {
      uid: user.uid,
      email: user.email ?? '',
      usuario: data.usuario,
      numero: data.numero,
      sector: data.sector,
      creadoEn: Date.now(),
    };
    await setDoc(ref, perfil);
  }
}
