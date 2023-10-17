import { Observable, map, switchMap, NEVER, combineLatest, of, startWith } from 'rxjs';
import type { Game } from './types';
import { browser } from '$app/environment';
import type { DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { auth$, client$ } from '.';

export * from './types';

export const games$ = combineLatest([auth$, client$]).pipe(
	switchMap(([auth, { gamesCollection, query, where, orderBy, limit, onSnapshot }]) => {
		if (auth == null) {
			return of([]);
		}

		const gamesQuerry = query(
			gamesCollection,
			where('uids', 'array-contains', auth.uid),
			orderBy('modified', 'desc'),
			limit(25)
		);

		return new Observable<QuerySnapshot<Game>>((subscriber) =>
			onSnapshot(gamesQuerry, subscriber)
		).pipe(map((snapshot) => snapshot.docs));
	}),
	startWith([])
);

export async function getGameSnapshots(gameId: string): Promise<Observable<Game | '404'>> {
	if (browser) {
		const { gamesCollection, doc, onSnapshot } = await import('./client');

		const gameRef = doc(gamesCollection, gameId);

		return new Observable<DocumentSnapshot<Game>>((subscriber) =>
			onSnapshot(gameRef, subscriber)
		).pipe(map((snapshot) => snapshot.data() ?? '404'));
	} else {
		return NEVER; //TODO
	}
}
