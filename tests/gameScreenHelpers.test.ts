import { describe, test, expect } from 'bun:test';
import {
  getToastMessage,
  getAutoSelectablePieceId,
  getHintMessage,
  getFinishedCount,
  getSortedPlayers,
  getFormattedGameTime,
} from '../src/lib/game/gameScreenHelpers';
import { Player, YutThrow } from '../src/lib/game/types';

const dummyT = (key: string) => key;

describe('gameScreenHelpers', () => {
  describe('getToastMessage', () => {
    test('returns null when lastMoveMessage is null', () => {
      expect(getToastMessage(null, dummyT)).toBeNull();
    });

    test('returns skip message', () => {
      expect(getToastMessage('skip', dummyT)).toBe('⏭️ next');
    });

    test('returns capture message with count', () => {
      expect(getToastMessage('capture:2', dummyT)).toBe('⚔️ hintCaptured (×2)');
      expect(getToastMessage('capture:', dummyT)).toBe('⚔️ hintCaptured (×1)');
    });

    test('returns carry message', () => {
      expect(getToastMessage('carry:p1', dummyT)).toBe('🤝 hintCarried');
    });

    test('returns finish message', () => {
      expect(getToastMessage('finish', dummyT)).toBe('🏁 hintFinished');
    });

    test('returns default move message for other values', () => {
      expect(getToastMessage('move', dummyT)).toBe('🚶 movePiece');
    });
  });

  describe('getAutoSelectablePieceId', () => {
    const createPlayer = (piecePositions: number[]): Player => ({
      id: 0,
      name: 'Player 1',
      avatarId: 'tiger',
      isAI: false,
      pieces: piecePositions.map((pos, idx) => ({
        id: `p-${idx}`,
        playerId: 0,
        position: pos,
        carrying: [],
      })),
    });

    const forwardYut: YutThrow = {
      result: 'do',
      sticks: [true, false, false, false],
      steps: 1,
      extraTurn: false,
    };

    const backDoYut: YutThrow = {
      result: 'back-do',
      sticks: [false, false, false, false],
      steps: -1,
      extraTurn: false,
    };

    test('returns null when not in selecting phase', () => {
      const player = createPlayer([-1, -1, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'throwing', forwardYut, null)).toBeNull();
    });

    test('returns null when currentYut is null', () => {
      const player = createPlayer([-1, -1, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'selecting', null, null)).toBeNull();
    });

    test('returns null when a piece is already selected', () => {
      const player = createPlayer([-1, -1, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'selecting', forwardYut, 'p-0')).toBeNull();
    });

    test('returns null when back-do and all pieces at home', () => {
      const player = createPlayer([-1, -1, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'selecting', backDoYut, null)).toBeNull();
    });

    test('auto-selects first home piece when no pieces on board and steps > 0', () => {
      const player = createPlayer([-1, -1, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'selecting', forwardYut, null)).toBe('p-0');
    });

    test('auto-selects board piece when only one piece is on board', () => {
      const player = createPlayer([-1, 5, -2, -2]);
      expect(getAutoSelectablePieceId(player, 'selecting', forwardYut, null)).toBe('p-1');
    });

    test('returns null when multiple pieces are on board', () => {
      const player = createPlayer([2, 5, -1, -1]);
      expect(getAutoSelectablePieceId(player, 'selecting', forwardYut, null)).toBeNull();
    });
  });

  describe('getHintMessage', () => {
    test('returns correct hint for throwing phase', () => {
      expect(getHintMessage('throwing', false, null, 0, dummyT)).toBe('hintThrow');
    });

    test('returns hintBackDo when no moves available', () => {
      expect(getHintMessage('selecting', true, null, 0, dummyT)).toBe('hintBackDo');
    });

    test('returns hintSelectPiece when selecting and no piece selected', () => {
      expect(getHintMessage('selecting', false, null, 0, dummyT)).toBe('hintSelectPiece');
    });

    test('returns hintSelectPiece when piece selected but 0 possible moves', () => {
      expect(getHintMessage('selecting', false, 'p-0', 0, dummyT)).toBe('hintSelectPiece');
    });

    test('returns hintChoosePath when piece selected with possible moves', () => {
      expect(getHintMessage('selecting', false, 'p-0', 2, dummyT)).toBe('hintChoosePath');
    });
  });

  describe('getFinishedCount and getSortedPlayers', () => {
    test('calculates finished piece count correctly', () => {
      const player: Player = {
        id: 0,
        name: 'P1',
        avatarId: 'tiger',
        isAI: false,
        pieces: [
          { id: '1', playerId: 0, position: -2, carrying: [] },
          { id: '2', playerId: 0, position: -2, carrying: [] },
          { id: '3', playerId: 0, position: 5, carrying: [] },
          { id: '4', playerId: 0, position: -1, carrying: [] },
        ],
      };
      expect(getFinishedCount(player)).toBe(2);
    });

    test('sorts players descending by finished count', () => {
      const p1: Player = {
        id: 0,
        name: 'P1',
        avatarId: 'tiger',
        isAI: false,
        pieces: [
          { id: '1', playerId: 0, position: -2, carrying: [] },
          { id: '2', playerId: 0, position: 0, carrying: [] },
        ],
      };
      const p2: Player = {
        id: 1,
        name: 'P2',
        avatarId: 'dragon',
        isAI: false,
        pieces: [
          { id: '3', playerId: 1, position: -2, carrying: [] },
          { id: '4', playerId: 1, position: -2, carrying: [] },
        ],
      };
      const sorted = getSortedPlayers([p1, p2]);
      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe(0);
    });
  });

  describe('getFormattedGameTime', () => {
    test('formats totalElapsedMs if present', () => {
      const result = getFormattedGameTime(125000, null);
      expect(result.minutes).toBe(2);
      expect(result.seconds).toBe(5);
      expect(result.formatted).toBe('2:05');
    });

    test('calculates elapsed time from gameStartTime', () => {
      const startTime = 1000000;
      const nowMs = 1065000; // 65 seconds later
      const result = getFormattedGameTime(0, startTime, nowMs);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(5);
      expect(result.formatted).toBe('1:05');
    });
  });
});
