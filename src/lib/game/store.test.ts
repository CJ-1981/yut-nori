import { describe, it, expect } from 'bun:test';
import { findCapturedPieces, findUpdatedCarriedPieces } from './store';
import { Player } from './types';

describe('store helper functions', () => {
  const createSamplePlayers = (): Player[] => [
    {
      id: 0,
      name: 'Player 1',
      avatarId: 'tiger',
      isAI: false,
      pieces: [
        { id: 'p0-0', playerId: 0, position: 2, carrying: [] },
        { id: 'p0-1', playerId: 0, position: -1, carrying: [] },
        { id: 'p0-2', playerId: 0, position: -1, carrying: [] },
        { id: 'p0-3', playerId: 0, position: -1, carrying: [] },
      ],
    },
    {
      id: 1,
      name: 'Player 2',
      avatarId: 'dragon',
      isAI: false,
      pieces: [
        { id: 'p1-0', playerId: 1, position: 5, carrying: ['p1-1'] },
        { id: 'p1-1', playerId: 1, position: 5, carrying: [] },
        { id: 'p1-2', playerId: 1, position: 10, carrying: [] },
        { id: 'p1-3', playerId: 1, position: -1, carrying: [] },
      ],
    },
  ];

  describe('findCapturedPieces', () => {
    it('returns empty array if isFinish is true', () => {
      const players = createSamplePlayers();
      const captured = findCapturedPieces(players, 0, 5, true);
      expect(captured).toEqual([]);
    });

    it('returns empty array if targetPos is negative', () => {
      const players = createSamplePlayers();
      const captured = findCapturedPieces(players, 0, -1, false);
      expect(captured).toEqual([]);
    });

    it('finds opponent pieces at target position', () => {
      const players = createSamplePlayers();
      // Player 0 landing on position 10 where Player 2 has p1-2
      const captured = findCapturedPieces(players, 0, 10, false);
      expect(captured).toEqual([
        { pieceId: 'p1-2', playerId: 1 },
      ]);
    });

    it('ignores own pieces at target position', () => {
      const players = createSamplePlayers();
      // Player 1 landing on position 5 (where Player 1 already is, and Player 0 is not)
      const captured = findCapturedPieces(players, 1, 5, false);
      expect(captured).toEqual([]);
    });

    it('returns empty array when no opponent piece is at target position', () => {
      const players = createSamplePlayers();
      const captured = findCapturedPieces(players, 0, 3, false);
      expect(captured).toEqual([]);
    });
  });

  describe('findUpdatedCarriedPieces', () => {
    it('returns initial carried if isFinish is true', () => {
      const players = createSamplePlayers();
      const player = players[0];
      const result = findUpdatedCarriedPieces(player, 'p0-0', ['p0-1'], 5, true);
      expect(result).toEqual(['p0-1']);
    });

    it('returns initial carried if targetPos is negative', () => {
      const players = createSamplePlayers();
      const player = players[0];
      const result = findUpdatedCarriedPieces(player, 'p0-0', [], -1, false);
      expect(result).toEqual([]);
    });

    it('stacks with own piece at target position', () => {
      const player: Player = {
        id: 0,
        name: 'Player 1',
        avatarId: 'tiger',
        isAI: false,
        pieces: [
          { id: 'p0-0', playerId: 0, position: 2, carrying: [] },
          { id: 'p0-1', playerId: 0, position: 5, carrying: ['p0-2'] },
          { id: 'p0-2', playerId: 0, position: 5, carrying: [] },
          { id: 'p0-3', playerId: 0, position: -1, carrying: [] },
        ],
      };

      // p0-0 moves to position 5, where p0-1 (carrying p0-2) already is
      const result = findUpdatedCarriedPieces(player, 'p0-0', [], 5, false);
      expect(result).toEqual(['p0-1', 'p0-2']);
    });
  });
});
