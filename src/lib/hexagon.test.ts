import { describe, it, expect } from "vitest";
import { halfSqrt3, round } from "./hexagon";

describe("round", () => {
	it("undoes the imprecision or Math.sqrt", () => {
		const almost3 = Math.pow(Math.sqrt(3), 2);

		expect(round(almost3)).toBe(3);

		expect(round(halfSqrt3 * halfSqrt3)).toBe(3 / 4);
	});
});
