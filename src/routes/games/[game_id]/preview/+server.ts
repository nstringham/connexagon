import { Color, decodeHex } from "$lib/board";
import Board from "$lib/Board.svelte";
import { render } from "svelte/server";
import type { RequestHandler } from "./$types";
import { error as kitError } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
  const { data, error } = await supabase.from("games").select("towers,cell_colors");
  if (error) {
    throw error;
  }

  if (data.length != 1) {
    kitError(404, "invalid game id");
  }

  const { towers, cell_colors } = data[0];

  const width = Number(url.searchParams.get("width") ?? 768);
  const height = Number(url.searchParams.get("height") ?? width);

  const { body: svg } = render(Board, {
    props: {
      towers: new Set(towers),
      cells: decodeHex(cell_colors),
      aspectRatio: width / height,
      cssColors: {
        [Color.UNCLAIMED]: "#ebebeb",
        [Color.RED]: "#e70000",
        [Color.GOLD]: "#ffb600",
        [Color.GREEN]: "#00b431",
        [Color.AQUA]: "#00cdd0",
        [Color.BLUE]: "#003ddf",
        [Color.PURPLE]: "#8803bd",
        [Color.PINK]: "#ff7db8",
      },
      xmlns: "http://www.w3.org/2000/svg",
    },
  });

  if (url.searchParams.has("svg")) {
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  }

  if (width * height > 10_000_000) {
    kitError(404, "image too large");
  }

  const { Resvg } = await import("./resvg");

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "#ffffff",
  });

  return new Response(resvg.render().asPng(), { headers: { "Content-Type": "image/png" } });
};
