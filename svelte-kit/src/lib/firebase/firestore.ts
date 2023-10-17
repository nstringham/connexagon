import { Observable, NEVER } from 'rxjs';
import type { Game } from './types';

export * from './types';

export const games$: Observable<Game[]> = NEVER;

export async function getGameSnapshots(gameId: string): Promise<Observable<Game | '404'>> {
	return NEVER; //TODO
}
