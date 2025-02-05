import { sql } from "$lib/db.server";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { generateBoard } from "$lib/board";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = {
  runtime: "nodejs22.x",
};

export const POST: RequestHandler = async ({ params: { game_id }, locals: { user } }) => {
  if (user == null) {
    error(401, "you must be logged in to start a game");
  }

  await sql.begin(async (sql) => {
    const result = await sql<{ started: boolean; host_user_id: string; players: number }[]>`
      select
        game.started_at is not null as started,
        host_user_id,
        count(*)::int as players
      from
        public.games as game
        join public.players as player on player.game_id = game.id
      where
        game.id = ${game_id}
      group by
        game.id
    `;

    if (result.length != 1) {
      error(404, "invalid game id");
    }

    const { started, host_user_id, players } = result[0];

    if (started) {
      error(400, "game has already started");
    }

    if (host_user_id !== user.id) {
      error(403, "only the host can start the game");
    }

    if (players < 2) {
      error(400, "game must have at least 2 players to start");
    }

    const { towers, cells } = generateBoard(players);

    const updateGame = sql`
      update public.games
      set
        towers = ${towers},
        cell_colors = ${cells},
        turn = 0,
        started_at = now()
      where
        id = ${game_id}
    `;

    const updatePlayers = sql`
      with
        ordered_players as (
          select
            user_id,
            row_number() over (
              order by
                random()
            ) - 1 as turn_order
          from
            players
          where
            game_id = ${game_id}
        )
      update public.players
      set
        turn_order = ordered_players.turn_order
      from
        ordered_players
      where
        players.user_id = ordered_players.user_id
        and game_id = ${game_id}
    `;

    await Promise.all([updateGame, updatePlayers]);
  });

  return new Response();
};
