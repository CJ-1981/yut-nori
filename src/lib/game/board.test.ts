import { describe, expect, it } from 'bun:test';
import { getPossibleMoves } from './board';

describe('getPossibleMoves', () => {
  describe('zero steps', () => {
    it('returns the current position and path unchanged when steps is 0', () => {
      const moves = getPossibleMoves(5, 'outer', 0);
      expect(moves).toEqual([
        {
          position: 5,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });

  describe('standard outer ring moves', () => {
    it('calculates forward moves along the outer ring', () => {
      // Moving 2 steps from position 1 on outer path
      const moves = getPossibleMoves(1, 'outer', 2);
      expect(moves).toEqual([
        {
          position: 3,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });

  describe('corner decisions and exceptions', () => {
    it('allows taking diagonal d5 at top-right corner 5', () => {
      const moves = getPossibleMoves(5, 'outer', 1);
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({
        position: 6,
        pathType: 'outer',
        isDiagonalChoice: false,
        isFinish: false,
      });
      expect(moves).toContainEqual({
        position: 25,
        pathType: 'd5',
        isDiagonalChoice: true,
        isFinish: false,
      });
    });

    it('allows taking diagonal d10 at top-left corner 10', () => {
      const moves = getPossibleMoves(10, 'outer', 1);
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({
        position: 11,
        pathType: 'outer',
        isDiagonalChoice: false,
        isFinish: false,
      });
      expect(moves).toContainEqual({
        position: 24,
        pathType: 'd10',
        isDiagonalChoice: true,
        isFinish: false,
      });
    });

    it('disallows diagonal entry at bottom-right start corner 0', () => {
      const moves = getPossibleMoves(0, 'outer', 1);
      expect(moves).toEqual([
        {
          position: 1,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });

    it('disallows diagonal entry at bottom-left corner 15 (one-way diagonal)', () => {
      const moves = getPossibleMoves(15, 'outer', 1);
      expect(moves).toEqual([
        {
          position: 16,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });

  describe('center position branching', () => {
    it('allows branching onto d10 (towards BR) when entering center from d5', () => {
      const moves = getPossibleMoves(20, 'd5', 1);
      expect(moves).toHaveLength(2);
      // Option 1: continue d5 -> 27
      expect(moves).toContainEqual({
        position: 27,
        pathType: 'd5',
        isDiagonalChoice: false,
        isFinish: false,
      });
      // Option 2: branch d10 -> 22
      expect(moves).toContainEqual({
        position: 22,
        pathType: 'd10',
        isDiagonalChoice: true,
        isFinish: false,
      });
    });

    it('allows branching onto d10 (towards BR) when entering center from d15', () => {
      const moves = getPossibleMoves(20, 'd15', 1);
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({
        position: 26,
        pathType: 'd15',
        isDiagonalChoice: false,
        isFinish: false,
      });
      expect(moves).toContainEqual({
        position: 22,
        pathType: 'd10',
        isDiagonalChoice: true,
        isFinish: false,
      });
    });

    it('allows branching onto d10 (towards BR) when entering center from d0', () => {
      const moves = getPossibleMoves(20, 'd0', 1);
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({
        position: 23,
        pathType: 'd0',
        isDiagonalChoice: false,
        isFinish: false,
      });
      expect(moves).toContainEqual({
        position: 22,
        pathType: 'd10',
        isDiagonalChoice: true,
        isFinish: false,
      });
    });

    it('provides single path continuation when already on d10 at center', () => {
      const moves = getPossibleMoves(20, 'd10', 1);
      expect(moves).toEqual([
        {
          position: 22,
          pathType: 'd10',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });

  describe('finish conditions and transitions', () => {
    it('marks finish when outer ring completes past position 0', () => {
      const moves = getPossibleMoves(19, 'outer', 1);
      expect(moves).toEqual([
        {
          position: 0,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: true,
        },
      ]);
    });

    it('marks finish when d10 path reaches position 0 from center in 3 steps', () => {
      const moves = getPossibleMoves(20, 'd5', 3);
      // d5 path: 20 -> 27 -> 28 -> 15 (outer)
      // d10 path: 20 -> 22 -> 21 -> 0 (finish line via d10, pathType transitions to outer)
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({
        position: 15,
        pathType: 'outer',
        isDiagonalChoice: false,
        isFinish: false,
      });
      expect(moves).toContainEqual({
        position: 0,
        pathType: 'outer',
        isDiagonalChoice: true,
        isFinish: true,
      });
    });

    it('transitions diagonal d0 to outer path at corner 10', () => {
      // 24 on d0 -> next is corner 10, transitions to outer
      const moves = getPossibleMoves(24, 'd0', 1);
      expect(moves).toEqual([
        {
          position: 10,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });

    it('transitions diagonal d5 to outer path at corner 15', () => {
      const moveFrom28 = getPossibleMoves(28, 'd5', 1);
      expect(moveFrom28).toEqual([
        {
          position: 15,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });

    it('transitions diagonal d15 to outer path at corner 5', () => {
      const moves = getPossibleMoves(25, 'd15', 1); // 25_d15 is 5
      expect(moves).toEqual([
        {
          position: 5,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });

  describe('negative steps (Back-Do)', () => {
    it('moves backward on outer path', () => {
      const moves = getPossibleMoves(5, 'outer', -1);
      expect(moves).toEqual([
        {
          position: 4,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });

    it('moves backward from position 0 on outer path to 19', () => {
      const moves = getPossibleMoves(0, 'outer', -1);
      expect(moves).toEqual([
        {
          position: 19,
          pathType: 'outer',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });

    it('moves backward along diagonal path', () => {
      const moves = getPossibleMoves(21, 'd0', -1);
      expect(moves).toEqual([
        {
          position: 0,
          pathType: 'd0',
          isDiagonalChoice: false,
          isFinish: false,
        },
      ]);
    });
  });
});
