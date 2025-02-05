import { POSTGRES_URL } from "$env/static/private";
import postgres from "postgres";
import type { Cell, Color } from "./board";

export const sql = postgres(POSTGRES_URL);

export function serializeBoard(board: Cell[]): string[] {
  return board.map(({ tower, color }) => `(${tower ? "t" : "f"},${color ?? ""})`);
}

export function deserializeBoard(board: string[]): Cell[] {
  return board.map((cell) => ({
    tower: cell.charAt(1) === "t",
    color: (cell.substring(3, cell.length - 1) || null) as Color | null,
  }));
}
