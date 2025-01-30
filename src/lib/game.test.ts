import { describe, expect, it } from "vitest";
import { generateBoard } from "./game";

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
