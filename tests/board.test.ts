import { describe, expect, test } from "bun:test";
import { rollYut } from "../src/lib/game/board";

describe("rollYut secure randomness", () => {
  test("returns valid YutThrowResult structure", () => {
    const res = rollYut();
    expect(res).toBeDefined();
    expect(["do", "gae", "geol", "yut", "mo", "back-do"]).toContain(res.result);
    expect(res.sticks).toHaveLength(4);
    expect(typeof res.steps).toBe("number");
    expect(typeof res.extraTurn).toBe("boolean");
  });

  test("generates all possible outcomes over multiple rolls", () => {
    const results = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const res = rollYut();
      results.add(res.result);
    }
    // Should see multiple unique outcomes in 500 throws
    expect(results.size).toBeGreaterThan(1);
  });
});
