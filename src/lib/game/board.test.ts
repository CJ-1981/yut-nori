import { describe, expect, test } from 'bun:test';
import {
  isCorner,
  isCenter,
  isDiagonalPoint,
  getPositionCoord,
  CORNER_POSITIONS,
  CENTER_POSITION,
  BOARD_POSITIONS,
} from './board';

describe('board helper functions', () => {
  describe('isCorner', () => {
    test('returns true for all defined corner positions', () => {
      for (const pos of CORNER_POSITIONS) {
        expect(isCorner(pos)).toBe(true);
      }
    });

    test('returns false for non-corner positions', () => {
      // Test non-corner outer positions, center position, diagonal positions, and out-of-bounds positions
      const nonCorners = [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 25, -1, 99];
      for (const pos of nonCorners) {
        expect(isCorner(pos)).toBe(false);
      }
    });
  });

  describe('isCenter', () => {
    test('returns true only for CENTER_POSITION (20)', () => {
      expect(isCenter(CENTER_POSITION)).toBe(true);
      expect(isCenter(20)).toBe(true);
    });

    test('returns false for non-center positions', () => {
      const nonCenters = [0, 5, 10, 15, 19, 21, 28, -1, 100];
      for (const pos of nonCenters) {
        expect(isCenter(pos)).toBe(false);
      }
    });
  });

  describe('isDiagonalPoint', () => {
    test('returns true for diagonal positions (21 to 28)', () => {
      for (let pos = 21; pos <= 28; pos++) {
        expect(isDiagonalPoint(pos)).toBe(true);
      }
    });

    test('returns false for positions outside diagonal range 21-28', () => {
      const nonDiagonals = [0, 5, 10, 15, 19, 20, 29, -1];
      for (const pos of nonDiagonals) {
        expect(isDiagonalPoint(pos)).toBe(false);
      }
    });
  });

  describe('getPositionCoord', () => {
    test('returns correct BoardCoord for valid positions', () => {
      for (let i = 0; i < BOARD_POSITIONS.length; i++) {
        expect(getPositionCoord(i)).toEqual(BOARD_POSITIONS[i]);
      }
    });

    test('returns fallback center coord { x: 2.5, y: 2.5 } for invalid positions', () => {
      expect(getPositionCoord(-1)).toEqual({ x: 2.5, y: 2.5 });
      expect(getPositionCoord(999)).toEqual({ x: 2.5, y: 2.5 });
    });
  });
});
