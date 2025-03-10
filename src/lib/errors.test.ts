import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("should return string unchanged", () => {
    expect(getErrorMessage("example string")).toBe("example string");
  });

  it("should get message from error", () => {
    expect(getErrorMessage(new Error("example message"))).toBe("example message");
  });
});
