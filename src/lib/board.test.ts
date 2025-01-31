import { describe, it, expect } from "vitest";
import { generateBoard, getAdjacentCells, getLayout, getSize } from "./board";
import { round } from "./hexagon";

describe("getSize", () => {
	it("returns the correct value", () => {
		expect(getSize(1)).toBe(1);
		expect(getSize(7)).toBe(2);
		expect(getSize(19)).toBe(3);
		expect(getSize(37)).toBe(4);
		expect(getSize(217)).toBe(9);
		expect(getSize(547)).toBe(14);
	});
});

describe("getLayout", () => {
	it("puts one hexagon in the center", () => {
		expect(getLayout(1)).to.deep.equal([[0, 0]]);
	});

	it("lays out 7 hexagons correctly", () => {
		const sqrt3 = round(Math.sqrt(3));
		const halfSqrt3 = round(Math.sqrt(3) / 2);

		expect(getLayout(2)).to.deep.equal([
			[-halfSqrt3, -1.5],
			[halfSqrt3, -1.5],
			[-sqrt3, 0],
			[0, 0],
			[sqrt3, 0],
			[-halfSqrt3, 1.5],
			[halfSqrt3, 1.5],
		]);
	});
});

describe("getAdjacentCells", () => {
	it("finds the 6 cells around a cell on the top half", () => {
		expect(getAdjacentCells(217, 48)).toBe([35, 36, 47, 49, 61, 62]);
		expect(getAdjacentCells(217, 51)).toBe([38, 39, 50, 52, 64, 65]);
	});

	it("finds the 6 cells around a cell on the bottom half", () => {
		expect(getAdjacentCells(217, 168)).toBe([154, 155, 167, 169, 180, 181]);
		expect(getAdjacentCells(217, 120)).toBe([103, 104, 119, 121, 135, 136]);
	});

	it("finds the 6 cells around the center cell", () => {
		expect(getAdjacentCells(217, 108)).toBe([91, 92, 107, 109, 124, 125]);
	});

	it("finds the 6 cells around the center cell on a larger board", () => {
		expect(getAdjacentCells(271, 135)).toBe([116, 117, 134, 136, 153, 154]);
	});

	it("finds the 4 cells around a top edge", () => {
		expect(getAdjacentCells(217, 3)).toBe([2, 4, 12, 13]);
	});

	it("finds the 4 cells around a side edge", () => {
		expect(getAdjacentCells(217, 55)).toBe([42, 56, 69, 70]);
		expect(getAdjacentCells(217, 162)).toBe([148, 149, 163, 175]);
	});

	it("finds the 3 cells around a corner", () => {
		expect(getAdjacentCells(217, 0)).toBe([1, 9, 10]);
		expect(getAdjacentCells(217, 8)).toBe([7, 17, 18]);
		expect(getAdjacentCells(217, 100)).toBe([84, 101, 117]);
	});
});

describe("generateBoard", () => {
	it("generates a size 9 board with 9 towers for 2 player", () => {
		const board = generateBoard(2);
		expect(board.length).toBe(217);
		expect(board.filter((cell) => cell.tower).length).toBe(9);
	});

	it("generates a size 10 board with 13 towers for 3 player", () => {
		const board = generateBoard(3);
		expect(board.length).toBe(271);
		expect(board.filter((cell) => cell.tower).length).toBe(13);
	});

	it("generates a size 13 board with 25 towers for 6 player", () => {
		const board = generateBoard(6);
		expect(board.length).toBe(469);
		expect(board.filter((cell) => cell.tower).length).toBe(25);
	});

	it("does not generate the same board every time", () => {
		expect(generateBoard(3)).to.not.equal(generateBoard(3));
	});
});
