import type { PageLoad } from "./$types";
import { error as kitError } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { game_id }, parent, depends }) => {
	depends(`supabase:games:${game_id}`);

	const { supabase } = await parent();

	const { data, error } = await supabase
		.from("games")
		.select(
			`
				id,
				board,
				turn,
				winner,
				players(user_id, turn_order, color, profile:profiles(name))
			`,
		)
		.eq("id", game_id);

	if (error) {
		console.error(error);
	}

	if (data == null || data.length == 0) {
		kitError(404);
	}

	return { game: data[0] };
};
