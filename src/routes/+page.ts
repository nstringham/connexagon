import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data: games } = await supabase
		.from("games")
		.select(
			"id, turn, winner_player_number, players(user_id, player_number, color, profiles(name))",
		)
		.order("id");
	return { games: games ?? [] };
};
