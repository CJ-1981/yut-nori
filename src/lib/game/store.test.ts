import { describe, test, expect, beforeEach } from 'bun:test';
import { useGameStore } from './store';

describe('GameStore - movePiece & _completeMove', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.getState().resetGame();
    useGameStore.getState().startGame();
  });

  test('movePiece from home moves piece to position 0 first', () => {
    const store = useGameStore.getState();
    const player0 = store.players[0];
    const pieceId = player0.pieces[0].id; // p0-0

    // Initially position is -1
    expect(player0.pieces[0].position).toBe(-1);

    // Call movePiece to move to position 3 on 'outer' path
    useGameStore.getState().movePiece(pieceId, 3, 'outer', false);

    // Immediately after movePiece call (wasAtHome = true), position should be 0 (intermediate start)
    const updatedState = useGameStore.getState();
    const updatedPiece = updatedState.players[0].pieces[0];
    expect(updatedPiece.position).toBe(0);
    expect(updatedPiece.pathType).toBe('outer');
  });

  test('movePiece from home completes move after timeout', async () => {
    const store = useGameStore.getState();
    const pieceId = store.players[0].pieces[0].id;

    useGameStore.getState().movePiece(pieceId, 3, 'outer', false);

    // Wait for the 500ms timeout in movePiece
    await new Promise((resolve) => setTimeout(resolve, 600));

    const finalPiece = useGameStore.getState().players[0].pieces[0];
    expect(finalPiece.position).toBe(3);
    expect(finalPiece.pathType).toBe('outer');
  });

  test('_completeMove directly moves piece on board', () => {
    const store = useGameStore.getState();
    const pieceId = store.players[0].pieces[0].id;

    // Direct move using _completeMove
    useGameStore.getState()._completeMove(pieceId, 5, 'd0', false);

    const piece = useGameStore.getState().players[0].pieces[0];
    expect(piece.position).toBe(5);
    expect(piece.pathType).toBe('d0');
  });

  test('invalid pieceId does nothing', () => {
    const initialState = useGameStore.getState();

    useGameStore.getState().movePiece('non-existent-piece', 2, 'outer', false);
    useGameStore.getState()._completeMove('non-existent-piece', 2, 'outer', false);

    const currentState = useGameStore.getState();
    expect(currentState.players).toEqual(initialState.players);
  });

  test('capturing opponent piece sends opponent back to home and grants extra turn', () => {
    // Setup: Place player 1's piece p1-0 at position 5
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 1) {
          return {
            ...p,
            pieces: p.pieces.map((pc, idx) =>
              idx === 0 ? { ...pc, position: 5, pathType: 'outer' as const } : pc
            ),
          };
        }
        return p;
      });
      return { players: updatedPlayers, currentPlayerIndex: 0 };
    });

    // Player 0 moves p0-0 to position 5 where Player 1 piece is located
    const p0PieceId = useGameStore.getState().players[0].pieces[0].id;
    useGameStore.getState()._completeMove(p0PieceId, 5, 'outer', false);

    const stateAfterCapture = useGameStore.getState();

    // Player 0 piece should be at position 5
    expect(stateAfterCapture.players[0].pieces[0].position).toBe(5);

    // Player 1 piece should be captured back to home (position -1, carrying empty, pathType undefined)
    expect(stateAfterCapture.players[1].pieces[0].position).toBe(-1);
    expect(stateAfterCapture.players[1].pieces[0].carrying).toEqual([]);
    expect(stateAfterCapture.players[1].pieces[0].pathType).toBeUndefined();

    // Message and extra turn checks
    expect(stateAfterCapture.lastMoveMessage).toBe('capture:1');
    expect(stateAfterCapture.extraTurns).toBe(1);
    expect(stateAfterCapture.turnPhase).toBe('throwing');
  });

  test('capturing opponent piece with carried pieces sends all carried pieces home', () => {
    // Setup: Player 1 has piece p1-0 carrying p1-1 at position 4
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 1) {
          return {
            ...p,
            pieces: p.pieces.map((pc) => {
              if (pc.id === 'p1-0') {
                return { ...pc, position: 4, pathType: 'outer' as const, carrying: ['p1-1'] };
              }
              if (pc.id === 'p1-1') {
                return { ...pc, position: 4, pathType: 'outer' as const };
              }
              return pc;
            }),
          };
        }
        return p;
      });
      return { players: updatedPlayers, currentPlayerIndex: 0 };
    });

    const p0PieceId = useGameStore.getState().players[0].pieces[0].id;
    useGameStore.getState()._completeMove(p0PieceId, 4, 'outer', false);

    const state = useGameStore.getState();

    // Both p1-0 and p1-1 of Player 1 should be captured back home
    expect(state.players[1].pieces[0].position).toBe(-1);
    expect(state.players[1].pieces[1].position).toBe(-1);
    expect(state.lastMoveMessage).toBe('capture:2');
  });

  test('carrying own piece groups pieces together when landing on same position', () => {
    // Setup: Player 0 already has p0-1 at position 3
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc) =>
              pc.id === 'p0-1' ? { ...pc, position: 3, pathType: 'outer' as const } : pc
            ),
          };
        }
        return p;
      });
      return { players: updatedPlayers, currentPlayerIndex: 0 };
    });

    // Player 0 moves p0-0 to position 3
    useGameStore.getState()._completeMove('p0-0', 3, 'outer', false);

    const state = useGameStore.getState();
    const p0_0 = state.players[0].pieces.find((p) => p.id === 'p0-0')!;
    const p0_1 = state.players[0].pieces.find((p) => p.id === 'p0-1')!;

    expect(p0_0.position).toBe(3);
    expect(p0_0.carrying).toContain('p0-1');
    expect(p0_1.position).toBe(3);
    expect(state.lastMoveMessage).toBe('carry:1');
  });

  test('moving a carried piece moves the main carrier and all carried pieces together', () => {
    // Setup: Player 0 has p0-0 carrying p0-1 at position 3
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc) => {
              if (pc.id === 'p0-0') return { ...pc, position: 3, pathType: 'outer' as const, carrying: ['p0-1'] };
              if (pc.id === 'p0-1') return { ...pc, position: 3, pathType: 'outer' as const };
              return pc;
            }),
          };
        }
        return p;
      });
      return { players: updatedPlayers, currentPlayerIndex: 0 };
    });

    // Move p0-1 (which is carried by p0-0) to position 6
    useGameStore.getState()._completeMove('p0-1', 6, 'outer', false);

    const state = useGameStore.getState();
    const p0_0 = state.players[0].pieces.find((p) => p.id === 'p0-0')!;
    const p0_1 = state.players[0].pieces.find((p) => p.id === 'p0-1')!;

    expect(p0_0.position).toBe(6);
    expect(p0_1.position).toBe(6);
  });

  test('finishing a piece sets position to -2 and grants extra turn', () => {
    const p0PieceId = useGameStore.getState().players[0].pieces[0].id;
    useGameStore.getState()._completeMove(p0PieceId, 0, 'outer', true);

    const state = useGameStore.getState();
    const piece = state.players[0].pieces[0];

    expect(piece.position).toBe(-2);
    expect(piece.pathType).toBeUndefined();
    expect(state.lastMoveMessage).toBe('finish');
    expect(state.extraTurns).toBe(1);
  });

  test('winning condition when all pieces are finished', () => {
    // Setup: Player 0 has 3 pieces already finished (-2)
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc, idx) =>
              idx < 3 ? { ...pc, position: -2 } : { ...pc, position: 1, pathType: 'outer' as const }
            ),
          };
        }
        return p;
      });
      return { players: updatedPlayers, currentPlayerIndex: 0 };
    });

    // Move final piece p0-3 to finish
    useGameStore.getState()._completeMove('p0-3', 0, 'outer', true);

    const state = useGameStore.getState();

    expect(state.winnerId).toBe(0);
    expect(state.phase).toBe('gameover');
  });

  test('next turn transitions to next player after move when no extra turn', async () => {
    // Setup currentPlayerIndex: 0
    useGameStore.setState({ currentPlayerIndex: 0 });

    // Single piece move on board with no capture, carry, or finish -> extraTurn is false
    useGameStore.setState((state) => {
      const updatedPlayers = state.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc, idx) =>
              idx === 0 ? { ...pc, position: 2, pathType: 'outer' as const } : pc
            ),
          };
        }
        return p;
      });
      return { players: updatedPlayers };
    });

    useGameStore.getState()._completeMove('p0-0', 5, 'outer', false);

    // Turn change is wrapped in setTimeout 800ms
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 900));

    expect(useGameStore.getState().currentPlayerIndex).toBe(1);
    expect(useGameStore.getState().turnPhase).toBe('throwing');
  });
});
