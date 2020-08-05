import { Injectable } from '@angular/core';
import { Observable, fromEvent, of, concat } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PalletService {

  public pallet$: Observable<Pallet>;

  constructor() {
    this.pallet$ = concat(
      of(this.getPallet()),
      fromEvent(matchMedia('(prefers-color-scheme: dark)'), 'change').pipe(map((event: MediaQueryListEvent) => {
        return this.getPallet(event.matches);
      }))
    );
  }

  getPallet(isDark?: boolean): Pallet {
    if (isDark === undefined) {
      isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (isDark) {
      return {
        red: '#F44336',
        orange: '#FF9800',
        yellow: '#FFEB3B',
        green: '#4CAF50',
        blue: '#2196F3',
        purple: '#673AB7',
        background: '#121212',
        main: '#dddddd'
      };
    } else {
      return {
        red: '#D50000',
        orange: '#FF6D00',
        yellow: '#FFD600',
        green: '#00C853',
        blue: '#2962FF',
        purple: '#6200EA',
        background: 'white',
        main: 'black'
      };
    }
  }
}

export type Pallet = {
  red: string,
  orange: string,
  yellow: string,
  green: string,
  blue: string,
  purple: string,
  background: string,
  main: string
};
