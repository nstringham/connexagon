import type { CompositeTypes } from "./database-types";
import { halfSqrt3, round } from "./hexagon";

export type Cell = CompositeTypes<"cell"> & { tower: boolean };

export type Point = [number, number];

export function getSize(area: number): number {
	return 0.5 + Math.sqrt(12 * area - 3) / 6;
}

export function getLayout(size: number): Point[] {
	const layout: Point[] = [];

	const rows = size * 2 - 1;
	const rowOffset = (rows - 1) / 2;

	const horizontalSpacing = 2 * halfSqrt3;
	const verticalSpacing = 1.5;

	for (let row = 0; row < rows; row++) {
		const columns = rows - Math.abs(row - (size - 1));
		const columnOffset = (columns - 1) / 2;

		for (let column = 0; column < columns; column++) {
			layout.push([
				round((column - columnOffset) * horizontalSpacing),
				(row - rowOffset) * verticalSpacing,
			]);
		}
	}

	return layout;
}

export function getAdjacentCells(length: number, index: number): number[] {
	const size = getSize(length);

	throw new Error("Not implemented yet!");
}

const emptyCell: Readonly<Cell> = { tower: false, color: null };
const towerCell: Readonly<Cell> = { tower: true, color: null };

export function generateBoard(players: number): Cell[] {
	const size = players + 7;

	const board = Array<Cell>(3 * size * (size - 1) + 1).fill(emptyCell);

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

export type TowerStats = {
	towers: number[];
	towersByColor: { [key in Enums<"color"> | "unclaimed"]: number };
};

/** finds all the towers in the board and counts how many towers of each color exist */
export function getTowers(board: Cell[]): TowerStats {
	const towers: number[] = [];
	const towersByColor = { unclaimed: 0, red: 0, green: 0, blue: 0 };

	for (const [i, cell] of board.entries()) {
		if (cell.tower) {
			towers.push(i);
			towersByColor[cell.color ?? "unclaimed"] += 1;
		}
	}

	return { towers, towersByColor };
}
