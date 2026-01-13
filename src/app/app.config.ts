import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp, FirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { initializeAuth, browserLocalPersistence } from 'firebase/auth';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => {
      const app = inject(FirebaseApp);
      return initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    }),

    provideFirestore(() => getFirestore()),
  ],
};
