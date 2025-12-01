// src/app/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionService } from '../services/selection';
import { GraphComponent } from './graph/graph';
import { HydrometrieService } from '../services/hydrometrie';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, GraphComponent],
  template: `
    <ng-container *ngIf="station; else empty">
      <aside class="sidebar">
        <header class="sb-header">
          <div class="sb-title">
            {{ station.libelle_station || station.code_station }}
          </div>
          <span class="chip" [class.ok]="isOk()" [class.ko]="!isOk()">
            {{ isOk() ? 'Opérationnelle' : 'Hors service' }}
          </span>
        </header>

        <section class="sb-card">
          <div class="row"><span>Code</span><b>{{ station.code_station }}</b></div>
          <div class="row"><span>Latitude</span><b>{{ station.latitude }}</b></div>
          <div class="row"><span>Longitude</span><b>{{ station.longitude }}</b></div>
        </section>

        <section class="sb-card hint">
          <div class="mt-4">
  <app-graph></app-graph>
</div>

        </section>
      </aside>
    </ng-container>

    <ng-template #empty>
      <aside class="sidebar empty">
        <div class="placeholder">
          <div class="ph-title">Sélectionne une station</div>
          <div class="ph-text">Clique sur un point vert/gris de la carte pour afficher ses détails.</div>
        </div>
      </aside>
    </ng-template>
  `,
  styles: [`
    .sidebar{
      width:380px; height:100vh; overflow:auto;
      background:#fff; border-left:1px solid #eef2f7;
      padding:16px; box-shadow:-4px 0 18px rgba(16,24,40,.06);
    }
    .empty{ display:flex; align-items:center; justify-content:center; }
    .placeholder{ text-align:center; color:#6b7280 }
    .ph-title{ font-weight:600; font-size:18px; margin-bottom:4px; color:#111827 }

    .sb-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
    .sb-title{ font-size:18px; font-weight:700; color:#111827; line-height:1.2 }
    .chip{
      padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600;
      background:#e5e7eb; color:#374151; border:1px solid #e5e7eb;
    }
    .chip.ok{ background:#ecfdf5; color:#065f46; border-color:#a7f3d0; }
    .chip.ko{ background:#fef2f2; color:#7f1d1d; border-color:#fecaca; }

    .sb-card{
      background:#fff; border:1px solid #eef2f7; border-radius:14px;
      padding:12px; margin-bottom:12px; box-shadow:0 2px 10px rgba(16,24,40,.05);
    }
    .row{ display:flex; align-items:center; justify-content:space-between; padding:8px 0; }
    .row+ .row{ border-top:1px dashed #e5e7eb }
    .row span{ color:#6b7280; }
    .row b{ color:#111827; font-weight:600 }

    .hint .hint-title{ font-weight:700; margin-bottom:4px; color:#0f172a }
    .hint .hint-text{ color:#475569; font-size:14px }
  `]
})
export class SidebarComponent {
  station: any = null;
  constructor(private selection: SelectionService,private hydro: HydrometrieService ) {
    this.selection.selectedStation$.subscribe(s => this.station = s);
  }
  isOk(){
    if (!this.station) return false;
    if (typeof this.station.en_service === 'boolean') return this.station.en_service;
    return (this.station.etat_station || '').toLowerCase().includes('service');
  }
}
