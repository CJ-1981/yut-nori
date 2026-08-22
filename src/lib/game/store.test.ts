import { describe, test, expect, beforeEach } from 'bun:test';
import { useGameStore } from './store';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useGameStore.getState().startGame();
  });

  test('initial state when starting game', () => {
    const state = useGameStore.getState();
    expect(state.phase).toBe('playing');
    expect(state.players.length).toBe(2);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[0].pieces.length).toBe(4);
    expect(state.players[0].pieces[0].position).toBe(-1);
  });

  test('piece movement and capture logic', () => {
    const store = useGameStore.getState();

    // Set up player 1 piece at position 3
    useGameStore.setState({
      players: store.players.map((p) => {
        if (p.id === 1) {
          return {
            ...p,
            pieces: p.pieces.map((pc, i) => (i === 0 ? { ...pc, position: 3, pathType: 'outer' } : pc)),
          };
        }
        return p;
      }),
    });

    // Player 0 moves piece p0-0 to position 3
    store._completeMove('p0-0', 3, 'outer', false);

    const updatedState = useGameStore.getState();
    const player0Piece = updatedState.players[0].pieces.find((p) => p.id === 'p0-0');
    const player1Piece = updatedState.players[1].pieces.find((p) => p.id === 'p1-0');

    expect(player0Piece?.position).toBe(3);
    expect(player1Piece?.position).toBe(-1); // Captured back to home
    expect(updatedState.lastMoveMessage).toBe('capture:1');
  });

  test('piece carrying logic when landing on own piece', () => {
    const store = useGameStore.getState();

    // Set up player 0 piece 1 (p0-1) already at position 5
    useGameStore.setState({
      players: store.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc) => (pc.id === 'p0-1' ? { ...pc, position: 5, pathType: 'outer' } : pc)),
          };
        }
        return p;
      }),
    });

    // Player 0 moves p0-0 to position 5
    store._completeMove('p0-0', 5, 'outer', false);

    const updatedState = useGameStore.getState();
    const p0_0 = updatedState.players[0].pieces.find((p) => p.id === 'p0-0');
    const p0_1 = updatedState.players[0].pieces.find((p) => p.id === 'p0-1');

    expect(p0_0?.position).toBe(5);
    expect(p0_0?.carrying).toContain('p0-1');
    expect(p0_1?.position).toBe(5);
    expect(updatedState.lastMoveMessage).toBe('carry:1');
  });

  test('finishing pieces and winning game', () => {
    const store = useGameStore.getState();

    // Set 3 pieces of player 0 as finished (-2)
    useGameStore.setState({
      players: store.players.map((p) => {
        if (p.id === 0) {
          return {
            ...p,
            pieces: p.pieces.map((pc, i) => (i > 0 ? { ...pc, position: -2 } : pc)),
          };
        }
        return p;
      }),
    });

    // Move last piece to finish
    store._completeMove('p0-0', 20, 'outer', true);

    const updatedState = useGameStore.getState();
    expect(updatedState.winnerId).toBe(0);
    expect(updatedState.phase).toBe('gameover');
    expect(updatedState.lastMoveMessage).toBe('finish');
  });
});
