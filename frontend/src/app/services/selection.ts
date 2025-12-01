import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectedStation {
  code_station: string;
  code_site?: string;  
  libelle_station?: string;
  latitude?: number;
  longitude?: number;
  etat_station?: string;
  en_service?: boolean;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private station$ = new BehaviorSubject<SelectedStation | null>(null);
  selectedStation$ = this.station$.asObservable();

  selectStation(s: SelectedStation | null) {
    this.station$.next(s);
  }
}
