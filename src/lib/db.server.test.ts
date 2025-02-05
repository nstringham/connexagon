import { describe, expect, it } from "vitest";
import { deserializeBoard, serializeBoard } from "./db.server";

describe("serializeBoard", () => {
  it("serializes a board", () => {
    expect(
      serializeBoard([
        { tower: false, color: "red" },
        { tower: true, color: null },
      ]),
    ).to.deep.equal(["(f,red)", "(t,)"]);
  });
});

describe("deserializeBoard", () => {
  it("deserializes a board", () => {
    expect(deserializeBoard(["(f,red)", "(t,)"])).to.deep.equal([
      { tower: false, color: "red" },
      { tower: true, color: null },
    ]);
  });
});
