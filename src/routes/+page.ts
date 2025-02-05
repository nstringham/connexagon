import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { supabase, user } = await parent();

  if (user == null) {
    return { games: [] };
  }

  const { data: games, error } = await supabase
    .from("players")
    .select(
      `
        game:games(
          id,
          turn,
          winner,
          players(user_id, turn_order, color, profile:profiles(name))
        )
      `,
    )
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
  }

  return { games: games ?? [] };
};
