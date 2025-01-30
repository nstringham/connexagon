import type { CompositeTypes } from "./database-types";

export type Cell = CompositeTypes<"cell"> & { tower: boolean };

const emptyCell: Readonly<Cell> = { tower: false, color: null };
const towerCell: Readonly<Cell> = { tower: true, color: null };

export function generateBoard(players: number): Cell[] {
	const size = players + 7;

	const board = Array<Cell>(3 * size * size - 3 * size + 1).fill(emptyCell);

	let towersRemaining = 4 * players + 1;

	while (towersRemaining > 0) {
		const index = Math.floor(Math.random() * board.length);

		if (board[index].tower) {
			continue;
		}

		board[index] = towerCell;
		towersRemaining--;
	}

	return board;
}
