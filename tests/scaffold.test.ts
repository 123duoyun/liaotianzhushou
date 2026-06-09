import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("project scaffold", () => {
  it("exports the home page component", () => {
    expect(typeof Home).toBe("function");
  });
});
