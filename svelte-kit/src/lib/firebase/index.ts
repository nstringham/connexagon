import { browser } from '$app/environment';
import { NEVER, Observable, from, shareReplay, switchMap } from 'rxjs';

const client$ = browser ? from(import('./client')).pipe(shareReplay()) : NEVER;

export const auth$ = client$.pipe(
	switchMap(({ auth }) => new Observable((subscriber) => auth.onAuthStateChanged(subscriber)))
);
