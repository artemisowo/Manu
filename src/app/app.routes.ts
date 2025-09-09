import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Contacto } from './contacto/contacto';
import { Nosotros } from './nosotros/nosotros';
import { Mapa } from './mapa/mapa';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'inicio', component: Inicio }, 
    { path: 'contacto', component: Contacto},
    { path: 'nosotros', component:Nosotros},
    { path: 'mapa', component: Mapa},
    //el resto de rutas añadir acá




    { path: '**', redirectTo: '' }
];
