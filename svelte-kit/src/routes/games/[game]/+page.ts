import { getGameSnapshots } from '$lib/firebase/firestore';

export async function load({ params }) {
	return {
		game$: getGameSnapshots(params.game)
	};
}
