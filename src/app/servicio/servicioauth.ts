import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export type perfilusuario = {
  uid: string;
  email: string;
  usuario: string;
  numero: string;
  sector: string;
  creadoen: number;
};

@Injectable({ providedIn: 'root' })
export class servicioauth {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async registrar(
    email: string,
    password: string,
    usuario: string,
    numero: string,
    sector: string
  ) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(cred.user, { displayName: usuario });
    await this.crearperfil(cred.user, { usuario, numero, sector });

    await sendEmailVerification(cred.user);

    return cred.user;
  }

  async iniciarsesion(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

    await this.forzarrefreshusuario(cred.user);

    if (!cred.user.emailVerified) {
      await signOut(this.auth);
      throw new Error('Correo no verificado. Revisa tu correo (y Spam) y vuelve a intentar.');
    }

    return cred.user;
  }

  async cerrarsesion() {
    await signOut(this.auth);
  }

  async correoverificadoactual(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    await this.forzarrefreshusuario(user);
    return !!user.emailVerified;
  }

  async reenviarverificacion() {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay sesión activa.');
    await sendEmailVerification(user);
  }

  async obtenerperfil(uid: string) {
    const ref = doc(this.firestore, 'usuarios', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as perfilusuario) : null;
  }

  private async crearperfil(user: User, data: { usuario: string; numero: string; sector: string }) {
    const ref = doc(this.firestore, 'usuarios', user.uid);

    const perfil: perfilusuario = {
      uid: user.uid,
      email: user.email ?? '',
      usuario: data.usuario,
      numero: data.numero,
      sector: data.sector,
      creadoen: Date.now(),
    };

    await setDoc(ref, perfil);
  }

  private async forzarrefreshusuario(user: User) {
    await user.getIdToken(true);
    await reload(user);
  }
async relogin(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(this.auth, email, password);
  await this.forzarrefreshusuario(cred.user);
  return cred.user;
}

}
