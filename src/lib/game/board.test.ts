import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { rollYut } from './board';

describe('rollYut', () => {
  const originalMathRandom = Math.random;

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe('Deterministic roll outcomes with mocked Math.random', () => {
    test('returns Mo when topCount is 4', () => {
      // r2 < 0.06 -> topCount = 4
      Math.random = () => 0.03;

      const result = rollYut();
      expect(result.result).toBe('mo');
      expect(result.steps).toBe(5);
      expect(result.extraTurn).toBe(true);
      expect(result.sticks.filter(Boolean).length).toBe(4);
      expect(result.backDoIndex).toBeUndefined();
    });

    test('returns Yut when topCount is 0', () => {
      // 0.06 <= r2 < 0.25 -> topCount = 0
      Math.random = () => 0.15;

      const result = rollYut();
      expect(result.result).toBe('yut');
      expect(result.steps).toBe(4);
      expect(result.extraTurn).toBe(true);
      expect(result.sticks.filter(Boolean).length).toBe(0);
      expect(result.backDoIndex).toBeUndefined();
    });

    test('returns Geol when topCount is 1', () => {
      // 0.25 <= r2 < 0.50 -> topCount = 1
      Math.random = () => 0.35;

      const result = rollYut();
      expect(result.result).toBe('geol');
      expect(result.steps).toBe(3);
      expect(result.extraTurn).toBe(false);
      expect(result.sticks.filter(Boolean).length).toBe(1);
      expect(result.backDoIndex).toBeUndefined();
    });

    test('returns Gae when topCount is 2', () => {
      // 0.50 <= r2 < 0.81 -> topCount = 2
      Math.random = () => 0.65;

      const result = rollYut();
      expect(result.result).toBe('gae');
      expect(result.steps).toBe(2);
      expect(result.extraTurn).toBe(false);
      expect(result.sticks.filter(Boolean).length).toBe(2);
      expect(result.backDoIndex).toBeUndefined();
    });

    test('returns Do when topCount is 3 and back-do check fails', () => {
      // r2 >= 0.81 -> topCount = 3
      // Subsequent random calls for shuffle and back-do check (> 0.25)
      const values = [0.9, 0.5, 0.5, 0.5, 0.5]; // 0.9 for topCount, then shuffle, then 0.5 for back-do check (>0.25)
      let idx = 0;
      Math.random = () => values[idx++ % values.length];

      const result = rollYut();
      expect(result.result).toBe('do');
      expect(result.steps).toBe(1);
      expect(result.extraTurn).toBe(false);
      expect(result.sticks.filter(Boolean).length).toBe(3);
      expect(result.backDoIndex).toBeUndefined();
    });

    test('returns Back-Do when topCount is 3 and back-do check passes', () => {
      // r2 >= 0.81 -> topCount = 3
      // Back-do check < 0.25 -> back-do
      // Sequence:
      // 1. r2 = 0.9 (topCount = 3)
      // 2-4. shuffle loop (i = 3, 2, 1) -> Math.floor(Math.random() * (i + 1))
      // 5. back-do check < 0.25 -> 0.1
      const values = [0.9, 0.0, 0.0, 0.0, 0.1];
      let idx = 0;
      Math.random = () => values[idx++ % values.length];

      const result = rollYut();
      expect(result.result).toBe('back-do');
      expect(result.steps).toBe(-1);
      expect(result.extraTurn).toBe(false);
      expect(result.sticks.filter(Boolean).length).toBe(3);
      expect(typeof result.backDoIndex).toBe('number');
      expect(result.sticks[result.backDoIndex!]).toBe(false);
    });
  });

  describe('Un-mocked random roll invariants across multiple iterations', () => {
    test('produces valid throw results over 1000 iterations', () => {
      for (let i = 0; i < 1000; i++) {
        const roll = rollYut();
        expect(roll.sticks.length).toBe(4);

        const trueCount = roll.sticks.filter(Boolean).length;

        switch (roll.result) {
          case 'mo':
            expect(trueCount).toBe(4);
            expect(roll.steps).toBe(5);
            expect(roll.extraTurn).toBe(true);
            expect(roll.backDoIndex).toBeUndefined();
            break;
          case 'yut':
            expect(trueCount).toBe(0);
            expect(roll.steps).toBe(4);
            expect(roll.extraTurn).toBe(true);
            expect(roll.backDoIndex).toBeUndefined();
            break;
          case 'geol':
            expect(trueCount).toBe(1);
            expect(roll.steps).toBe(3);
            expect(roll.extraTurn).toBe(false);
            expect(roll.backDoIndex).toBeUndefined();
            break;
          case 'gae':
            expect(trueCount).toBe(2);
            expect(roll.steps).toBe(2);
            expect(roll.extraTurn).toBe(false);
            expect(roll.backDoIndex).toBeUndefined();
            break;
          case 'do':
            expect(trueCount).toBe(3);
            expect(roll.steps).toBe(1);
            expect(roll.extraTurn).toBe(false);
            expect(roll.backDoIndex).toBeUndefined();
            break;
          case 'back-do':
            expect(trueCount).toBe(3);
            expect(roll.steps).toBe(-1);
            expect(roll.extraTurn).toBe(false);
            expect(typeof roll.backDoIndex).toBe('number');
            expect(roll.sticks[roll.backDoIndex!]).toBe(false);
            break;
          default:
            throw new Error(`Unexpected result: ${(roll as any).result}`);
        }
      }
    });
  });
});
