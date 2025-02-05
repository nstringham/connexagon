import { deserializeBoard, serializeBoard, sql } from "$lib/db.server";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { doTurn, getMaxTurnSize, getTowers, InvalidTurnError, type Color } from "$lib/board";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = {
  runtime: "nodejs22.x",
};

function isIntegerArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((n) => Number.isInteger(n));
}

export const POST: RequestHandler = async ({ params: { game_id }, locals: { user }, request }) => {
  if (user == null) {
    error(401, "you must be logged in to start a game");
  }

  const turn: unknown = await request.json();

  if (!isIntegerArray(turn)) {
    error(400, "body must be an array of integers");
  }

  if (new Set(turn).size !== turn.length) {
    error(400, "turn may not contain duplicates");
  }

  await sql.begin(async (sql) => {
    type QueryResult = (
      | {
          board: string[];
          turn_number: number;
        }
      | {
          board: null;
          turn_number: null;
        }
    ) & {
      completed: boolean;
      user_id: string;
      color: Color | null;
    };

    const result = await sql<QueryResult[]>`
      select
        board,
        turn as turn_number,
        completed_at is not null as completed,
        player.user_id,
        player.color
      from
        public.games as game
        join (
          select
            game_id,
            count(*) as count
          from
            public.players
          group by
            game_id
        ) as player_count on player_count.game_id = game.id
        join public.players as player on player.game_id = game.id
        and player.turn_order = game.turn % player_count.count
      where
        game.id = ${game_id}
    `;

    if (result.length != 1) {
      error(404, "invalid game id");
    }

    const { board: rawBoard, turn_number, completed, user_id, color } = result[0];

    if (completed) {
      error(400, "game has already completed");
    }

    if (user_id !== user.id) {
      error(403, "it's not your turn");
    }

    if (rawBoard == null) {
      error(400, "this game has not started yet");
    }

    if (turn.some((n) => n < 0 || n >= rawBoard.length)) {
      error(400, `each cell index must be between 0 and ${rawBoard.length}`);
    }

    if (color == null) {
      error(400, "you must have a color to make a turn");
    }

    const board = deserializeBoard(rawBoard);

    const { towersByColor } = getTowers(board);

    const maxTurnSize = getMaxTurnSize(turn_number, towersByColor[color]);

    if (turn.length > maxTurnSize) {
      error(400, `you may not claim more than ${maxTurnSize} cells in one turn`);
    }

    let claimedTowers: number;

    try {
      claimedTowers = doTurn(board, turn, color);
    } catch (e) {
      if (e instanceof InvalidTurnError) {
        error(400, e.message);
      } else {
        throw e;
      }
    }

    let updateGame: Promise<unknown>;

    if (towersByColor[color] + claimedTowers >= 5) {
      updateGame = sql`
        update public.games
        set
          board = ${serializeBoard(board)},
          winner = ${color},
          completed_at = now()
        where
          id = ${game_id}
      `;
    } else {
      updateGame = sql`
        update public.games
        set
          board = ${serializeBoard(board)},
          turn = ${turn_number + 1}
        where
          id = ${game_id}
      `;
    }

    const insertTurn = sql`
      insert into
        public.turns (game_id, turn_number, cells)
      values
        (
          ${game_id},
          ${turn_number},
          ${turn}
        );
    `;

    await Promise.all([updateGame, insertTurn]);
  });

  return new Response();
};
