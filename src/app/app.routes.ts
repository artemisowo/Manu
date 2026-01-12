import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Contacto } from './contacto/contacto';
import { Nosotros } from './nosotros/nosotros';
import { mapa } from './mapa/mapa';
import { Registro } from './registro/registro';
import { IniciarSesion } from './iniciar-sesion/iniciar-sesion';
import { perfil } from './perfil/perfil';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'inicio', component: Inicio }, 
    { path: 'contacto', component: Contacto},
    { path: 'nosotros', component:Nosotros},
    { path: 'mapa', component: mapa},
    { path: 'registro', component: Registro},
    { path: 'iniciarsesion', component: IniciarSesion},
    { path: 'perfil', component: perfil },

    //el resto de rutas añadir acá




    { path: '**', redirectTo: '' }
];
