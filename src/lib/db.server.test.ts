import { describe, expect, it } from "vitest";
import { serializeBoard } from "./db.server";

describe("serializeBoard", () => {
	it("serializes a board", () => {
		expect(
			serializeBoard([
				{ tower: false, color: "red" },
				{ tower: true, color: null },
			]),
		).toBe('{"(false,red)","(true,)"}');
	});
});
