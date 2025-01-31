import { POSTGRES_URL } from "$env/static/private";
import postgres from "postgres";
import type { Cell } from "./board";

export const sql = postgres(POSTGRES_URL);

export function serializeBoard(board: Cell[]) {
	return "{" + board.map(({ tower, color }) => `"(${tower},${color ?? ""})"`).join(",") + "}";
}
