import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Contacto } from './contacto/contacto';
import { Nosotros } from './nosotros/nosotros';
import { mapa } from './mapa/mapa';
import { registro } from './registro/registro';
import { iniciar_sesion  } from './iniciar-sesion/iniciar-sesion';
import { perfil } from './perfil/perfil';
import { verificado } from './verificado/verificado';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'inicio', component: Inicio },
  { path: 'contacto', component: Contacto },
  { path: 'nosotros', component: Nosotros },
  { path: 'mapa', component: mapa },
  { path: 'registro', component: registro },
  { path: 'iniciarsesion', component: iniciar_sesion  },
  { path: 'perfil', component: perfil },
  { path: 'verificado', component: verificado },

  { path: '**', redirectTo: '' },
];
