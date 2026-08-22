import { describe, expect, test } from "bun:test";
import { getPositionCoord, BOARD_POSITIONS } from "../board";

describe("getPositionCoord", () => {
  test("returns correct coordinates for valid positions (0 to 28)", () => {
    // Check key positions
    expect(getPositionCoord(0)).toEqual({ x: 5, y: 0 }); // Bottom-right start
    expect(getPositionCoord(5)).toEqual({ x: 5, y: 5 }); // Top-right corner
    expect(getPositionCoord(10)).toEqual({ x: 0, y: 5 }); // Top-left corner
    expect(getPositionCoord(15)).toEqual({ x: 0, y: 0 }); // Bottom-left corner
    expect(getPositionCoord(20)).toEqual({ x: 2.5, y: 2.5 }); // Center position

    // Check all valid indices against BOARD_POSITIONS
    BOARD_POSITIONS.forEach((coord, index) => {
      expect(getPositionCoord(index)).toEqual(coord);
    });
  });

  test("returns default center coordinate { x: 2.5, y: 2.5 } for edge cases and out-of-bounds positions", () => {
    // Negative indices
    expect(getPositionCoord(-1)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(-100)).toEqual({ x: 2.5, y: 2.5 });

    // Out-of-bounds upper indices (BOARD_POSITIONS length is 29)
    expect(getPositionCoord(29)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(30)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(100)).toEqual({ x: 2.5, y: 2.5 });

    // Floating-point and non-integer inputs
    expect(getPositionCoord(2.5)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(-0.5)).toEqual({ x: 2.5, y: 2.5 });

    // Special numeric values
    expect(getPositionCoord(NaN)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(Infinity)).toEqual({ x: 2.5, y: 2.5 });
    expect(getPositionCoord(-Infinity)).toEqual({ x: 2.5, y: 2.5 });
  });
});
