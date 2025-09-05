import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';

export const routes: Routes = [
    {path:'',component:Inicio},
    {path:'inicio',component:Inicio},
    //el resto de rutas añadir acá



    
    {path: '**', redirectTo: ''}
];
