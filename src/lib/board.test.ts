import { describe, it, expect } from "vitest";
import { generateBoard, getLayout, getSize } from "./board";
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
