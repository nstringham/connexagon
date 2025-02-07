import { Color, decodeHex } from "$lib/board";
import Board from "$lib/Board.svelte";
import { render } from "svelte/server";
import type { RequestHandler } from "./$types";
import { error as kitError } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  const { data, error } = await supabase.from("games").select("towers,cell_colors");
  if (error) {
    throw error;
  }

  if (data.length != 1) {
    kitError(404, "invalid game id");
  }

  const { towers, cell_colors } = data[0];

  const { body: svg } = render(Board, {
    props: {
      towers: new Set(towers),
      cells: decodeHex(cell_colors),
      xmlns: "http://www.w3.org/2000/svg",
      cssColors: {
        [Color.UNCLAIMED]: undefined,
        [Color.RED]: "#e70000",
        [Color.GOLD]: "#ffb600",
        [Color.GREEN]: "#00b431",
        [Color.AQUA]: "#00cdd0",
        [Color.BLUE]: "#003ddf",
        [Color.PURPLE]: "#8803bd",
        [Color.PINK]: "#ff7db8",
      },
    },
  });

  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
};
