import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { supabase, user } = await parent();

  const { data, error } = await supabase
    .from("games")
    .select(
      `
        id,
        created_at,
        players(user_id, color, profile:profiles(name))
      `,
    )
    .is("started_at", null);

  if (error) {
    console.error(error);
  }

  const games =
    data?.filter((game) => game.players.every((player) => player.user_id !== user?.id)) ?? [];

  games.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return { games };
};
