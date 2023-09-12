import { browser } from '$app/environment';
import type { User } from 'firebase/auth';
import { NEVER, Observable, from, shareReplay, switchMap } from 'rxjs';

export const client$ = browser ? from(import('./client')).pipe(shareReplay()) : NEVER;

export const auth$ = client$.pipe(
	switchMap(
		({ auth }) => new Observable<User | null>((subscriber) => auth.onAuthStateChanged(subscriber))
	)
);
