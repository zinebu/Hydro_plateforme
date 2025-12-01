// src/app/components/map-page/map-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map';
import { SidebarComponent } from './sidebar';
import { SelectionService } from '../services/selection';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, MapComponent, SidebarComponent],
  template: `
    <div class="wrap">
      <div class="map-col"><app-map></app-map></div>
      <app-sidebar *ngIf="(selection.selectedStation$ | async)"></app-sidebar>
    </div>
  `,
  styles: [`
    .wrap { display:flex; height:100vh; background:linear-gradient(180deg,#f8fafc 0%, #ffffff 40%); }
    .map-col { flex:1; min-width:0; }
  `]
})
export class MapPageComponent {
  constructor(public selection: SelectionService) {}
}
