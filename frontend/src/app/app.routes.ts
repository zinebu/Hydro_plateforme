// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components//home';
import { MapPageComponent } from './components//map-page';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'carte', component: MapPageComponent },
  { path: '**', redirectTo: '' }
];
