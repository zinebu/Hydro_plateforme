// src/app/components/graph/graph.component.ts
import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, Plugin } from 'chart.js';
import { HydrometrieService } from '../../services/hydrometrie';
import { SelectionService } from '../../services/selection';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

Chart.register(...registerables);

/* -------------------- Types -------------------- */
type Grandeur = 'H' | 'Q';
interface Observation {
  code_station?: string;
  code_site?: string;
  grandeur_hydro: Grandeur;
  date_obs: string;
  resultat_obs: number | string;
}
interface StationLite {
  code_station?: string;
  code_site?: string;
  libelle?: string;
}

/* --------- Plugin : crosshair vertical --------- */
const Crosshair: Plugin<'line'> = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements();
    if (!active?.length) return;
    const el: any = active[0]?.element;
    const x: number | undefined = el?.x;
    if (typeof x !== 'number') return;

    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(59,130,246,0.6)';
    ctx.stroke();
    ctx.restore();
  }
};

/* --------- Plugin : ombre sous la ligne -------- */
const LineShadow: Plugin<'line'> = {
  id: 'lineShadow',
  beforeDatasetsDraw(chart) {
    const ctx = chart.ctx as CanvasRenderingContext2D;
    ctx.save();
    ctx.shadowColor = 'rgba(59,130,246,0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;
  },
  afterDatasetsDraw(chart) {
    chart.ctx.restore();
  }
};

Chart.register(Crosshair, LineShadow);

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" role="region" aria-label="Graphique hydrométrie">
      <div class="card-head">
        <div class="title">
          <span class="dot" aria-hidden="true"></span>
          <span>Hydrométrie</span>
        </div>
        <div class="hint" *ngIf="subtitle">{{ subtitle }}</div>
      </div>

      <div class="graph-wrap" [class.loading]="isLoading">
        <canvas #canvas [class.hidden]="!!noDataMsg"></canvas>

        <div class="empty" *ngIf="noDataMsg">{{ noDataMsg }}</div>

        <div class="loading-badge" *ngIf="isLoading && !noDataMsg && !hasChart">
          Chargement…
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; width:100%; }

    .card {
      border-radius: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      border: 1px solid #eef2f7;
      box-shadow: 0 10px 30px rgba(2,12,27,0.06);
      overflow: hidden;
    }

    .card-head {
      display:flex; justify-content:space-between; align-items:center;
      padding:12px 14px 6px 14px;
      border-bottom:1px solid #f1f5f9;
      background: radial-gradient(1200px 1200px at -10% -40%, rgba(59,130,246,0.08), transparent 40%);
    }

    .title { display:flex; align-items:center; gap:10px; font-weight:700; color:#0f172a; }
    .dot { width:10px; height:10px; border-radius:50%; background:linear-gradient(90deg,#3b82f6,#22d3ee); box-shadow:0 0 12px rgba(34,211,238,0.6); }
    .hint { font-size:12px; color:#64748b; font-weight:600; }

    .graph-wrap { height:300px; position:relative; width:100%; }
    canvas { width:100% !important; height:100% !important; display:block; }
    .hidden { opacity:0; pointer-events:none; }

    .empty {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      background: repeating-linear-gradient(-45deg,#f8fafc 0 10px,#f1f5f9 10px 20px);
      border-top:1px dashed #e2e8f0;
      color:#64748b; font-weight:700; text-align:center; padding:12px;
    }

    .loading-badge {
      position:absolute; top:10px; right:10px; padding:4px 10px; border-radius:9999px;
      background:rgba(241,245,249,0.95); border:1px solid #e2e8f0; font-size:12px; font-weight:600;
      color:#334155; box-shadow:0 4px 10px rgba(2,12,27,0.06); pointer-events:none;
    }

    .graph-wrap.loading::after {
      content:""; position:absolute; inset:0; background: rgba(248,250,252,0.35); pointer-events:none;
    }
  `]
})
export class GraphComponent implements OnDestroy {

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart<'line'> | null = null;
  private readonly destroy$ = new Subject<void>();
  private currentSite: string | null = null;

  noDataMsg: string | null = 'Sélectionne une station pour afficher le graphe';
  subtitle: string | null = null;
  isLoading = false;

  get hasChart(): boolean { return !!this.chart; }

  constructor(
    private readonly hydro: HydrometrieService,
    private readonly selection: SelectionService
  ) {
    this.selection.selectedStation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((st: StationLite | null) => {
        this.currentSite = st?.code_site ?? null;
        this.subtitle = st?.libelle ?? st?.code_station ?? null;

        if (st?.code_station) {
          this.noDataMsg = null;
          this.loadGraph(st.code_station);
        } else {
          this.showNoData('Sélectionne une station pour afficher le graphe');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyChart();
  }

  /* ==================== Utils ==================== */

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private showNoData(msg: string): void {
    this.destroyChart();
    this.noDataMsg = msg;
    this.isLoading = false;
  }

  private formatLabel(d: string | Date): string {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mn = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mn}`;
  }

  private createGradients(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gradLine = ctx.createLinearGradient(0, 0, w, 0);
    gradLine.addColorStop(0, 'rgba(59,130,246,1)');
    gradLine.addColorStop(0.6, 'rgba(56,189,248,1)');
    gradLine.addColorStop(1, 'rgba(99,102,241,1)');

    const gradFill = ctx.createLinearGradient(0, 0, 0, h);
    gradFill.addColorStop(0, 'rgba(56,189,248,0.22)');
    gradFill.addColorStop(1, 'rgba(255,255,255,0)');

    return { gradLine, gradFill };
  }

  private normalizeHeightsIfNeeded(values: number[], isHeight: boolean): number[] {
    if (!isHeight || values.length === 0) return values;
    const max = Math.max(...values);
    if (max > 200) return values.map(v => v / 1000); // mm -> m
    if (max > 20)  return values.map(v => v / 100);  // cm -> m
    return values;
  }

  /* ==================== Chart ==================== */

  private buildChart(label: string, labels: string[], values: number[]): void {
    if (!this.canvasRef) return;

    this.destroyChart();

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { gradLine, gradFill } = this.createGradients(ctx, canvas.width, canvas.height);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: gradLine,
          backgroundColor: gradFill,
          borderWidth: 2.5,
          fill: 'start',
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.92)',
            borderColor: 'rgba(148,163,184,0.3)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#f8fafc',
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 8, color: '#475569', font: { weight: '600' } as any },
            grid: { color: 'rgba(226,232,240,0.6)' },
            border: { color: 'rgba(203,213,225,0.8)' }
          },
          y: {
            ticks: { color: '#475569', font: { weight: '600' } as any },
            grid: { color: 'rgba(226,232,240,0.55)' },
            border: { color: 'rgba(203,213,225,0.8)' }
          }
        }
      }
    });
  }

  /* ==================== Data ==================== */

  private loadGraph(codeStation: string): void {
    this.isLoading = true;

    this.hydro.getObservationsFor(codeStation, this.currentSite ?? undefined, 7)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: { data?: Observation[] } | null) => {
          const rows: Observation[] = Array.isArray(res?.data) ? res!.data! : [];
          if (!rows.length) return this.showNoData('Aucune donnée disponible pour cette station.');

          const byStation = rows.filter(r =>
            (r.code_station && r.code_station === codeStation) ||
            (!r.code_station && this.currentSite && r.code_site === this.currentSite)
          );
          if (!byStation.length) return this.showNoData('Aucune donnée disponible pour cette station.');

          const rowsH = byStation.filter(r => r.grandeur_hydro === 'H');
          const rowsQ = byStation.filter(r => r.grandeur_hydro === 'Q');

          const serie = rowsH.length ? rowsH : rowsQ;
          const isHeight = rowsH.length > 0;
          const label = isHeight
            ? `Hauteur d'eau (m) — ${codeStation}`
            : `Débit (m³/s) — ${codeStation}`;

          // Tri par date
          serie.sort((a, b) => new Date(a.date_obs).getTime() - new Date(b.date_obs).getTime());
          const recent = serie.slice(-200);

          const labels = recent.map(r => this.formatLabel(r.date_obs));
          let values = recent
            .map(r => Number(r.resultat_obs))
            .filter(Number.isFinite);

          values = this.normalizeHeightsIfNeeded(values, isHeight);

          this.noDataMsg = null;
          this.buildChart(label, labels, values);
        },
        error: () => this.showNoData('Erreur API.')
      });
  }
}
