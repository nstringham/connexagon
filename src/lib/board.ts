import type { CompositeTypes, Enums } from "./database-types";
import { halfSqrt3, round } from "./hexagon";
import triangleNumbers from "virtual:triangle-numbers";

export type Color = Enums<"color">;

export const colors: readonly Color[] = ["red", "green", "blue"];

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
	const centerOfBoard = length / 2;

	// mirror if index is in the bottom half of the board
	if (index > centerOfBoard) {
		const mirror = (cell: number) => length - 1 - cell;
		return getAdjacentCells(length, mirror(index)).map(mirror);
	}

	const size = getSize(length);

	const rowWidth = Math.round(Math.sqrt(2 * (index + triangleNumbers[size - 1] + 1)));

	const beginningOfRow = triangleNumbers[rowWidth - 1] - triangleNumbers[size - 1];

	const endOfRow = beginningOfRow + rowWidth - 1;

	const cells: number[] = [];

	// top neighbors
	if (index >= size) {
		// not first row
		if (index !== beginningOfRow) {
			cells.push(index - rowWidth);
		}
		if (index !== endOfRow) {
			cells.push(index - rowWidth + 1);
		}
	}

	// left and right neighbors
	if (index !== beginningOfRow) {
		cells.push(index - 1);
	}
	if (index !== endOfRow) {
		cells.push(index + 1);
	}

	// bottom neighbors
	if (endOfRow < centerOfBoard) {
		// not middle row
		cells.push(index + rowWidth, index + rowWidth + 1);
	} else {
		// middle row
		if (index !== beginningOfRow) {
			cells.push(index + rowWidth - 1);
		}
		cells.push(index + rowWidth);
	}

	return cells;
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
	towersByColor: { [key in Color | "unclaimed"]: number };
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

/**
 * calculates how many cells a player may select on their turn
 * @param turn the index of the turn the game is currently on
 * @param towers the number of towers the player has already captured
 * @returns the maximum number of cells the player may place this turn
 */
export function getMaxTurnSize(turn: number, towers: number) {
	return Math.min(4, turn + 1, 5 - towers);
}

export class InvalidTurnError extends Error {}

/**
 * Applies a turn and all it's effects to the game board
 * @param board the game board
 * @param turn the indexes of the cells claimed by the player in this turn
 * @param color the color of the player
 * @throws `InvalidTurnError` if the turn is not valid for the board
 */
export function doTurn(board: Cell[], turn: number[], color: Color) {
	for (const i of turn) {
		if (board[i].tower) {
			throw new InvalidTurnError("you can not directly claim a tower");
		}

		if (board[i].color !== null) {
			throw new InvalidTurnError("you may not claim a cell that is already claimed");
		}

		board[i].color = color;
	}

	const checkedCells = new Set<number>();
	for (const turnCell of turn) {
		const cellsToCheck = [turnCell];

		const towers = new Set<number>();

		while (cellsToCheck.length > 0) {
			const cell = cellsToCheck.pop()!;

			if (checkedCells.has(cell)) {
				continue;
			}
			checkedCells.add(cell);

			if (board[cell].tower && (board[cell].color === null || board[cell].color === color)) {
				towers.add(cell);
				continue;
			}

			if (board[cell].color === color) {
				cellsToCheck.push(...getAdjacentCells(board.length, cell));
			}
		}

		if (towers.size > 1) {
			for (const tower of towers) {
				board[tower].color = color;
			}
		}
	}
}
