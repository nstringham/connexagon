import { Color } from "$lib/board";
import Board from "$lib/Board.svelte";
import { render } from "svelte/server";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { Resvg } from "@resvg/resvg-js";
import { sql } from "$lib/db.server";

export const GET: RequestHandler = async ({ params: { game_id }, url, cookies }) => {
  const result = await sql<{ towers: number[]; cell_colors: Buffer; players: number }[]>`
    select
      game.towers,
      game.cell_colors,
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

  const { towers, cell_colors, players } = result[0];

  function getCells(): Uint8Array {
    if (cell_colors.length !== 0) {
      return new Uint8Array(cell_colors);
    } else {
      const size = players + 7;
      return new Uint8Array(3 * size * (size - 1) + 1);
    }
  }

  const width = Number(url.searchParams.get("width") ?? 768);
  const height = Number(url.searchParams.get("height") ?? width);

  const darkMode = cookies.get("lightMode") === "false";

  const { body: svg } = render(Board, {
    props: {
      towers: new Set(towers),
      cells: getCells(),
      aspectRatio: width / height,
      cssColors: {
        [Color.UNCLAIMED]: darkMode ? "#181818" : "#ebebeb",
        [Color.RED]: "#e70000",
        [Color.GOLD]: "#ffb600",
        [Color.GREEN]: "#00b431",
        [Color.AQUA]: "#00cdd0",
        [Color.BLUE]: "#003ddf",
        [Color.PURPLE]: "#8803bd",
        [Color.PINK]: "#ff7db8",
      },
      towerColor: darkMode ? "#ffffff" : "#000000",
      xmlns: "http://www.w3.org/2000/svg",
    },
  });

  if (url.searchParams.has("svg")) {
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  }

  if (width * height > 10_000_000) {
    error(404, "image too large");
  }

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: darkMode ? "#121212" : "#ffffff",
  });

  return new Response(resvg.render().asPng(), { headers: { "Content-Type": "image/png" } });
};
