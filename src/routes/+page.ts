import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const { supabase, user } = await parent();

  if (user == null) {
    return { games: [] };
  }

  const { data, error } = await supabase
    .from("players")
    .select(
      `
        created_at,
        game:games(
          id,
          turn,
          winner,
          started_at,
          completed_at,
          players(user_id, turn_order, color, profile:profiles(name))
        )
      `,
    )
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
  }

  const games = data?.map((row) => ({ ...row.game, joined_at: row.created_at })) ?? [];

  for (const game of games) {
    if (game.started_at != null) {
      game.players.sort((a, b) => a.turn_order! - b.turn_order!);
    }
  }

  const { pending, yourTurn, current, finished } = Object.groupBy(games, (game) => {
    if (game.turn == null) {
      return "pending";
    } else if (game.completed_at != null) {
      return "finished";
    } else if (game.players[game.turn % game.players.length].user_id == user.id) {
      return "yourTurn";
    } else {
      return "current";
    }
  });

  pending?.sort((a, b) => (a.joined_at < b.joined_at ? 1 : -1));
  yourTurn?.sort((a, b) => (a.started_at! < b.started_at! ? 1 : -1));
  current?.sort((a, b) => (a.started_at! < b.started_at! ? 1 : -1));
  finished?.sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1));

  return {
    games: [
      { name: "Pending Games", games: pending },
      { name: "Your Turn", games: yourTurn },
      { name: "Current Games", games: current },
      { name: "Finished Games", games: finished },
    ].filter((group) => group.games != undefined && group.games.length > 0),
  };
};
