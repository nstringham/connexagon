import { describe, it, expect } from "vitest";
import { getLayout, getSize, type Point } from "./board";

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
	function expectPointsToBeAlmostEqual(actual: Point[], expected: Point[], delta = 0.000001) {
		expect(actual).to.have.length(expected.length);

		for (let i = 0; i < expected.length; i++) {
			expect(actual[i][0]).to.be.approximately(expected[i][0], delta);
			expect(actual[i][1]).to.be.approximately(expected[i][1], delta);
		}
	}

	it("puts one hexagon in the center", () => {
		expectPointsToBeAlmostEqual(getLayout(1), [[0, 0]]);
	});

	it("lays out 7 hexagons correctly", () => {
		expectPointsToBeAlmostEqual(getLayout(2), [
			[-1 / 3, -1 / Math.sqrt(3)],
			[1 / 3, -1 / Math.sqrt(3)],
			[-2 / 3, 0],
			[0, 0],
			[2 / 3, 0],
			[-1 / 3, 1 / Math.sqrt(3)],
			[1 / 3, 1 / Math.sqrt(3)],
		]);
	});
});
