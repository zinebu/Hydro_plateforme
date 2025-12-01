import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Station {
  code_station: string;
  libelle_station?: string;
  longitude: number;
  latitude: number;
  etat_station?: string;
  en_service?: boolean;
  [k: string]: any;
}

interface PagedStations {
  count: number;
  data: Station[];
}

interface ObservationsResponse {
  data: any[];
}

@Injectable({ providedIn: 'root' })
export class HydrometrieService {
  private readonly v2 = 'https://hubeau.eaufrance.fr/api/v2/hydrometrie';

  constructor(private readonly http: HttpClient) {}

  /** Liste des stations dans une bbox "lon_min,lat_min,lon_max,lat_max" */
  getStations(bbox: string, size = 500): Observable<PagedStations> {
    const params = new HttpParams()
      .set('bbox', bbox)
      .set('size', String(size));

    return this.http.get<PagedStations>(`${this.v2}/referentiel/stations`, { params });
  }

  /**
   * Observations temps réel (H et Q) pour une station/code entité
   * sur les `days` derniers jours (max API ~ 1 mois).
   */
  getObservationsFor(code_station: string, code_site?: string, days = 7): Observable<ObservationsResponse> {
    const code_entite = this.toEntite(code_station, code_site);
    const { fromISO, toISO } = this.dateRangeISO(days);

    const params = new HttpParams()
      .set('code_entite', code_entite)
      .set('grandeur_hydro', 'H,Q')
      .set('date_debut_obs', fromISO)
      .set('date_fin_obs', toISO)
      .set('size', '20000')
      .set('sort', 'asc');

    return this.http.get<ObservationsResponse>(`${this.v2}/observations_tr`, { params });
  }

  /**
   * Séries élaborées (fallback si TR vide) :
   *  - QmnJ : débit moyen journalier (m³/s)
   *  - HIXnJ : hauteur instantanée max journalière (mm)
   *  - QmM / HIXM : variantes mensuelles
   */
  getObsElab(
    code_station: string,
    type: 'QmnJ' | 'HIXnJ' | 'QmM' | 'HIXM' = 'QmnJ',
    days = 365,
    code_site?: string
  ): Observable<ObservationsResponse> {
    const code_entite = this.toEntite(code_station, code_site);
    const { fromISO, toISO } = this.dateRangeISO(days);

    const params = new HttpParams()
      .set('code_entite', code_entite)
      .set('type_observation', type)
      .set('date_debut_obs', fromISO)
      .set('date_fin_obs', toISO)
      .set('size', '20000')
      .set('sort', 'asc');

    return this.http.get<ObservationsResponse>(`${this.v2}/obs_elab`, { params });
  }

  /* -------------------- Helpers -------------------- */

  /** Construit le code entité à partir d'un code station + site si besoin. */
  private toEntite(codeStation: string, codeSite?: string): string {
    return (codeSite && codeStation.length === 2) ? `${codeSite}${codeStation}` : codeStation;
  }

  /** Renvoie les bornes ISO (YYYY-MM-DD) pour les `days` derniers jours. */
  private dateRangeISO(days: number): { fromISO: string; toISO: string } {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - days);

    const toISO = now.toISOString().slice(0, 10);
    const fromISO = from.toISOString().slice(0, 10);
    return { fromISO, toISO };
    }
}
