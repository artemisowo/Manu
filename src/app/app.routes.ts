import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Contacto } from './contacto/contacto';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'inicio', component: Inicio }, {
        path: 'contacto', component: Contacto
    },
    //el resto de rutas añadir acá




    { path: '**', redirectTo: '' }
];
