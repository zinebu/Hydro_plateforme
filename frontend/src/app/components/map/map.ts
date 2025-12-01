// src/app/components/map/map.ts
import { Component, AfterViewInit, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BridgesService } from '../../services/bridge';
import { HydrometrieService } from '../../services/hydrometrie';
import { SelectionService } from '../../services/selection';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="topbar">
      <div class="topbar-inner">
        <label class="switch">
          <input type="checkbox" [(ngModel)]="hideNonOperational" (change)="refreshStations()" />
          <span class="slider"></span>
        </label>
        <span class="label">Masquer les stations non-opérationnelles</span>
      </div>
    </div>

    <div class="map-wrapper">
      <div id="map" aria-label="Carte hydrologique"></div>

      <div class="legend">
        <div class="item"><span class="dot ok"></span> Opérationnelle</div>
        <div class="item"><span class="dot ko"></span> Non opérationnelle</div>
        <div class="item"><span class="emoji" aria-hidden="true">🛤️</span> Pont</div>
      </div>
    </div>
  `,
  styles: [`
    /* Map container */
    .map-wrapper {
      position: relative;
      width: 100%;
      height: calc(100vh - 72px);
      overflow: hidden;
    }

    #map {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
      animation: fadeIn .4s ease-out;
    }

    /* Topbar */
    .topbar {
      height: 72px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,.03);
      backdrop-filter: blur(8px);
    }

    .topbar-inner {
      display: flex;
      align-items: center;
      gap: 16px;
      transform: translateY(2px);
    }

    .label {
      color: #0f172a;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
    }

    /* Toggle switch */
    .switch { position: relative; display: inline-block; width: 52px; height: 28px; }
    .switch input { opacity: 0; width: 0; height: 0; }

    .slider {
      position: absolute; inset: 0; cursor: pointer;
      background: #e5e7eb; transition: .3s;
      border-radius: 999px; border: 1px solid #d1d5db;
      box-shadow: inset 0 2px 3px rgba(0,0,0,0.06);
    }

    .slider:before {
      content: ""; position: absolute; height: 20px; width: 20px; left: 4px; top: 3px;
      background: #fff; transition: .3s; border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,.15);
    }

    input:checked + .slider { background: #34d399; border-color: #10b981; }
    input:checked + .slider:before { transform: translateX(24px); }

    /* Legend (on-map) */
    .legend {
      position: absolute;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 24px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(6px);
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
    }

    .legend .item { display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 14px; }

    .dot {
      width: 12px; height: 12px; border-radius: 50%; border: 2px solid;
    }
    .dot.ok { background: #34d399; border-color: #059669; }
    .dot.ko { background: #d1d5db; border-color: #9ca3af; }

    .emoji { font-size: 18px; }

    /* Animations */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  private stationsLayer = L.layerGroup();
  private selectedMarker?: L.CircleMarker;
  hideNonOperational = false;

  constructor(
    private bridges: BridgesService,
    private hydro: HydrometrieService,
    private selection: SelectionService,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map('map', { zoomControl: true }).setView([43.7, 7.25], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.stationsLayer.addTo(this.map);
    this.loadBridges();
    this.refreshStations();
  }

  loadBridges() {
    this.bridges.list().subscribe(list => {
      list.forEach((b: any) => {
        if (b.lat && b.lon) {
          L.marker([b.lat, b.lon], {
            icon: L.divIcon({ html: '🛤️', className: 'bridge-marker', iconSize: [20,20] })
          })
          .bindTooltip(b.name || b.bridge_id)
          .addTo(this.map);
        }
      });
    });
  }

  refreshStations() {
    this.stationsLayer.clearLayers();
    this.selectedMarker = undefined;

    const bbox = '7.0,43.5,7.6,43.95';
    this.hydro.getStations(bbox).subscribe(res => {
      res.data.forEach((s: any) => {
        const lat = parseFloat(s.latitude ?? s.lat ?? s.y ?? s.Y ?? s.coordonnees?.lat ?? s.latitude_station);
        const lon = parseFloat(s.longitude ?? s.lon ?? s.x ?? s.X ?? s.coordonnees?.lon ?? s.longitude_station);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        const operational =
          typeof s.en_service === 'boolean'
            ? s.en_service
            : (s.etat_station ? s.etat_station.toLowerCase().includes('service') : true);

        if (this.hideNonOperational && !operational) return;

        const marker = L.circleMarker([lat, lon], {
          radius: 7, fillOpacity: 0.95, weight: 2,
          color: operational ? '#0a7b21' : '#888',
          fillColor: operational ? '#34d399' : '#bdbdbd',
        })
        .bindTooltip(`${s.libelle_station || s.code_station || 'Station'}`, { direction:'top', offset:[0,-6] })
        .addTo(this.stationsLayer);

        marker.on('click', () => {
          this.zone.run(() => {
            const codeStation =
              s.code_station
              ?? s.codeStation
              ?? s.code_station_hydro
              ?? s.codeStationHydro
              ?? s.cd_station_hydro
              ?? s.code_entite_hydro
              ?? s.codeEntiteHydro
              ?? null;

            this.selection.selectStation({
              ...s,
              code_station: codeStation,
              latitude: lat,
              longitude: lon
            });

            if (this.selectedMarker) this.selectedMarker.setStyle({ radius: 7, weight: 2 });
            marker.setStyle({ radius: 10, weight: 3 });
            this.selectedMarker = marker;
          });
        });
      });
    });
  }
}
