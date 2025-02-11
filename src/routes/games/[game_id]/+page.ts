import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { game_id }, parent, depends }) => {
  depends(`supabase:games:${game_id}`);

  const { supabase } = await parent();

  const { data, error: dbError } = await supabase
    .from("games")
    .select(
      `
        id,
        host_user_id,
        towers,
        cell_colors,
        turn,
        winner,
        completed_at,
        players(user_id, turn_order, color, profile:profiles(name))
      `,
    )
    .eq("id", game_id);

  if (dbError) {
    console.error(dbError);
  }

  if (data == null || data.length == 0) {
    error(404, "invalid game id");
  }

  const game = data[0];

  return { game };
};
