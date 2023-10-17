import { Observable, NEVER } from 'rxjs';
import type { Game } from './types';

export * from './types';

export const games$: Observable<{ data: () => Game; id: string }[]> = NEVER;

export async function getGameSnapshots(gameId: string): Promise<Observable<Game | '404'>> {
	return NEVER; //TODO
}
