import { describe, it, expect } from "vitest";
import { getLayout, getSize } from "./board";
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
