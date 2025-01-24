import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { PageLoad } from "./$types";
import type { Database } from "$lib/database-types";

export const load: PageLoad = async ({ parent }) => {
	const { supabase, user } = await parent();
	return { games: await getGamesForUser(supabase, user) };
};

async function getGamesForUser(supabase: SupabaseClient<Database>, user: User | null) {
	if (user == null) {
		return [];
	}

	const { data: games, error } = await supabase
		.from("players")
		.select(
			`
				game:games(
					id,
					turn,
					winner_player_number,
					players(user_id, player_number, color, profile:profiles(name))
				)
			`,
		)
		.eq("user_id", user?.id);

	if (error) {
		console.error(error);
	}

	return games ?? [];
}
