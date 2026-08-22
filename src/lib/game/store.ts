'use client';

import { create } from 'zustand';
import { AVATARS, AvatarId, GamePhase, Piece, Player, TurnPhase, YutThrow } from './types';
import { getPossibleMoves, PathType, rollYut, MoveOption } from './board';

export interface GameStore {
  // Game configuration
  phase: GamePhase;
  beginnerMode: boolean;
  numPlayers: number;
  players: Player[];
  currentPlayerIndex: number;

  // Turn state
  turnPhase: TurnPhase;
  currentYut: YutThrow | null;
  yutHistory: YutThrow[];
  possibleMoves: MoveOption[];
  selectedPieceId: string | null;
  extraTurns: number;

  // Timing
  gameStartTime: number;
  turnStartTime: number;
  totalElapsedMs: number;

  // UI state
  showYutAnimation: boolean;
  lastMoveMessage: string | null;
  winnerId: number | null;

  // Settings
  backDoAdvantage: boolean; // when true, back-do with no pieces on board brings a piece to start

  // Actions
  setPhase: (phase: GamePhase) => void;
  setBeginnerMode: (v: boolean) => void;
  setBackDoAdvantage: (v: boolean) => void;
  setNumPlayers: (n: number) => void;
  setPlayer: (index: number, data: Partial<Player>) => void;
  startGame: () => void;
  resetGame: () => void;

  throwYut: () => YutThrow;
  setYutResult: (result: YutThrow) => void;
  selectPiece: (pieceId: string | null) => void;
  movePiece: (pieceId: string, targetPos: number, targetPath: PathType, isFinish: boolean) => void;
  nextTurn: () => void;
  setTurnPhase: (phase: TurnPhase) => void;
  setShowYutAnimation: (v: boolean) => void;
  setLastMoveMessage: (msg: string | null) => void;
  updateElapsed: () => void;
  computePossibleMoves: () => void;
  canMoveAnyPiece: () => boolean;
  skipTurn: () => void;
  _completeMove: (pieceId: string, targetPos: number, targetPath: PathType, isFinish: boolean) => void;
}

const PLAYER_COLORS = ['#E85D04', '#1B6CA8', '#C9184A', '#386641'];
const PLAYER_STARTS: AvatarId[] = ['tiger', 'dragon', 'phoenix', 'turtle'];

function createInitialPlayers(num: number): Player[] {
  return Array.from({ length: num }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    avatarId: PLAYER_STARTS[i] ?? AVATARS[i % AVATARS.length].id,
    isAI: false,
    pieces: Array.from({ length: 4 }, (_, j) => ({
      id: `p${i}-${j}`,
      playerId: i,
      position: -1, // home
      carrying: [],
    })),
  }));
}

function defaultPlayers(): Player[] {
  return createInitialPlayers(2);
}

const initialState = {
  phase: 'menu' as GamePhase,
  beginnerMode: false,
  backDoAdvantage: false,
  numPlayers: 2,
  players: defaultPlayers(),
  currentPlayerIndex: 0,
  turnPhase: 'throwing' as TurnPhase,
  currentYut: null as YutThrow | null,
  yutHistory: [] as YutThrow[],
  possibleMoves: [] as MoveOption[],
  selectedPieceId: null as string | null,
  extraTurns: 0,
  gameStartTime: 0,
  turnStartTime: 0,
  totalElapsedMs: 0,
  showYutAnimation: false,
  lastMoveMessage: null as string | null,
  winnerId: null as number | null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setBeginnerMode: (beginnerMode) => set({ beginnerMode }),

  setBackDoAdvantage: (backDoAdvantage) => set({ backDoAdvantage }),

  setNumPlayers: (n) => {
    // Preserve existing player customizations (avatar, name) where possible,
    // and only create new players for any extra slots.
    const existing = get().players;
    const fresh = createInitialPlayers(n);
    const players = Array.from({ length: n }, (_, i) => {
      const prev = existing[i];
      if (prev) {
        // Keep user-selected avatar/name, just reset pieces (in case of restart)
        return {
          ...prev,
          pieces: Array.from({ length: 4 }, (_, j) => ({
            id: `p${i}-${j}`,
            playerId: i,
            position: -1, // home
            carrying: [],
          })),
        };
      }
      // New slot - use default from freshly created player
      return fresh[i];
    });
    set({ numPlayers: n, players });
  },

  setPlayer: (index, data) =>
    set((state) => ({
      players: state.players.map((p, i) => (i === index ? { ...p, ...data } : p)),
    })),

  startGame: () => {
    const num = get().numPlayers;
    const existingPlayers = get().players;
    // Preserve user-selected name/avatar from setup; only reset game-state fields.
    const players = existingPlayers.slice(0, num).map((p, i) => ({
      ...p,
      id: i,
      // Always rebuild pieces so IDs match the (possibly new) player index
      // and positions are reset to home.
      pieces: Array.from({ length: 4 }, (_, j) => ({
        id: `p${i}-${j}`,
        playerId: i,
        position: -1, // home
        carrying: [],
      })),
    }));
    set({
      phase: 'playing',
      players,
      currentPlayerIndex: 0,
      turnPhase: 'throwing',
      currentYut: null,
      yutHistory: [],
      possibleMoves: [],
      selectedPieceId: null,
      extraTurns: 0,
      gameStartTime: Date.now(),
      turnStartTime: Date.now(),
      totalElapsedMs: 0,
      showYutAnimation: false,
      lastMoveMessage: null,
      winnerId: null,
    });
  },

  resetGame: () => set({ ...initialState, players: defaultPlayers() }),

  throwYut: () => {
    const result = rollYut();
    set({ currentYut: result, yutHistory: [...get().yutHistory, result] });
    return result;
  },

  setYutResult: (result) => set({ currentYut: result }),

  selectPiece: (pieceId) => {
    set({ selectedPieceId: pieceId });
    // Recompute moves when piece is selected
    if (pieceId) {
      setTimeout(() => get().computePossibleMoves(), 0);
    } else {
      set({ possibleMoves: [] });
    }
  },

  computePossibleMoves: () => {
    const { currentYut, players, currentPlayerIndex, selectedPieceId, backDoAdvantage } = get();
    if (!currentYut || !selectedPieceId) {
      set({ possibleMoves: [] });
      return;
    }
    const player = players[currentPlayerIndex];
    const piece = player.pieces.find((p) => p.id === selectedPieceId);
    if (!piece) {
      set({ possibleMoves: [] });
      return;
    }
    let moves: MoveOption[] = [];
    if (piece.position === -1) {
      // Piece is at home
      if (currentYut.steps > 0) {
        // Normal throw: bring piece to start (0), then move `steps` forward
        moves = getPossibleMoves(0, 'outer', currentYut.steps);
      } else if (currentYut.steps < 0 && backDoAdvantage) {
        // Back-do advantage: if no pieces on board, bring piece to start (position 0)
        const hasBoardPieces = player.pieces.some((p) => p.position >= 0);
        if (!hasBoardPieces) {
          moves = [{ position: 0, pathType: 'outer', isDiagonalChoice: false, isFinish: false }];
        }
      }
    } else if (piece.position === -2) {
      // Finished piece - can't move
      moves = [];
    } else {
      // On board - use piece's pathType
      const pathType: PathType = piece.pathType ?? 'outer';
      moves = getPossibleMoves(piece.position, pathType, currentYut.steps);
    }
    set({ possibleMoves: moves });
  },

  canMoveAnyPiece: () => {
    const { currentYut, players, currentPlayerIndex, backDoAdvantage } = get();
    if (!currentYut) return false;
    const player = players[currentPlayerIndex];
    const hasBoardPieces = player.pieces.some((p) => p.position >= 0);
    const hasHomePieces = player.pieces.some((p) => p.position === -1);

    for (const piece of player.pieces) {
      if (piece.position === -2) continue; // finished
      if (piece.position === -1) {
        // Home piece - can move only if not back-do
        if (currentYut.steps > 0) return true;
        // Back-do advantage: if no pieces on board, back-do brings a piece to start
        if (currentYut.steps < 0 && backDoAdvantage && !hasBoardPieces && hasHomePieces) {
          return true;
        }
      } else {
        // On board - can always move
        return true;
      }
    }
    return false;
  },

  skipTurn: () => {
    const state = get();
    set({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.numPlayers,
      turnStartTime: Date.now(),
      turnPhase: 'throwing',
      currentYut: null,
      selectedPieceId: null,
      possibleMoves: [],
      lastMoveMessage: 'skip',
    });
  },

  movePiece: (pieceId, targetPos, targetPath, isFinish) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const piece = player.pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    const wasAtHome = piece.position === -1;
    const startPos = targetPos; // final target position

    // If piece is coming from home, first animate it to start (position 0)
    // then to the final position after a short delay
    if (wasAtHome && !isFinish) {
      // Step 1: Move piece to start (position 0) first
      const intermediatePlayers = state.players.map((p) => {
        if (p.id !== player.id) return p;
        return {
          ...p,
          pieces: p.pieces.map((pc) =>
            pc.id === pieceId
              ? { ...pc, position: 0, pathType: 'outer' as PathType, carrying: [] }
              : pc
          ),
        };
      });
      set({
        players: intermediatePlayers,
        possibleMoves: [],
        selectedPieceId: null,
      });

      // Step 2: After delay, move to final position
      setTimeout(() => {
        get()._completeMove(pieceId, startPos, targetPath, isFinish);
      }, 500);
      return;
    }

    get()._completeMove(pieceId, startPos, targetPath, isFinish);
  },

  _completeMove: (pieceId, targetPos, targetPath, isFinish) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const piece = player.pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    // Find carrier: if selected piece is carried by another, use carrier as main
    let mainPieceId = pieceId;
    let allCarried = [...piece.carrying];
    const carrier = player.pieces.find((p) => p.carrying.includes(pieceId));
    if (carrier) {
      mainPieceId = carrier.id;
      allCarried = [...carrier.carrying];
    }

    const newPos = targetPos;
    const newPath = targetPath;
    let captured: { pieceId: string; playerId: number }[] = [];

    if (!isFinish && newPos >= 0) {
      for (const otherPlayer of state.players) {
        if (otherPlayer.id === player.id) continue;
        for (const otherPiece of otherPlayer.pieces) {
          if (otherPiece.position === newPos) {
            if (!captured.some((c) => c.pieceId === otherPiece.id)) {
              captured.push({ pieceId: otherPiece.id, playerId: otherPlayer.id });
            }
            for (const carriedId of otherPiece.carrying) {
              if (!captured.some((c) => c.pieceId === carriedId)) {
                captured.push({ pieceId: carriedId, playerId: otherPlayer.id });
              }
            }
          }
        }
      }
    }

    let carried = [...allCarried];
    if (!isFinish && newPos >= 0) {
      for (const ownPiece of player.pieces) {
        if (ownPiece.id === mainPieceId || allCarried.includes(ownPiece.id)) continue;
        if (ownPiece.position === newPos && ownPiece.position !== -2) {
          if (!carried.includes(ownPiece.id)) carried.push(ownPiece.id);
          for (const subCarried of ownPiece.carrying) {
            if (!carried.includes(subCarried)) carried.push(subCarried);
          }
        }
      }
    }

    const capturedIds = new Set(captured.map((c) => c.pieceId));
    const updatedPlayers = state.players.map((p) => {
      if (capturedIds.size > 0 && p.id !== player.id) {
        return {
          ...p,
          pieces: p.pieces.map((pc) =>
            capturedIds.has(pc.id)
              ? { ...pc, position: -1, carrying: [], pathType: undefined }
              : pc
          ),
        };
      }
      if (p.id !== player.id) return p;
      return {
        ...p,
        pieces: p.pieces.map((pc) => {
          if (pc.id === mainPieceId) {
            return { ...pc, position: isFinish ? -2 : newPos, pathType: isFinish ? undefined : newPath, carrying: carried };
          }
          if (carried.includes(pc.id)) {
            return { ...pc, position: isFinish ? -2 : newPos, pathType: isFinish ? undefined : newPath };
          }
          return pc;
        }),
      };
    });

    // Check for winner
    let winnerId: number | null = null;
    for (const p of updatedPlayers) {
      if (p.pieces.every((pc) => pc.position === -2)) {
        winnerId = p.id;
        break;
      }
    }

    const hadCapture = captured.length > 0;
    const hadNewCarry = carried.length > allCarried.length;
    const extraTurn = isFinish || hadCapture || (state.currentYut?.extraTurn ?? false);

    let message = 'move';
    if (hadCapture) message = `capture:${captured.length}`;
    else if (hadNewCarry) message = `carry:${carried.length}`;
    else if (isFinish) message = 'finish';

    set({
      players: updatedPlayers,
      possibleMoves: [],
      selectedPieceId: null,
      currentYut: null,
      winnerId,
      phase: winnerId !== null ? 'gameover' : 'playing',
      lastMoveMessage: message,
      turnPhase: extraTurn && winnerId === null ? 'throwing' : 'throwing',
      extraTurns: extraTurn && winnerId === null ? state.extraTurns + 1 : 0,
      turnStartTime: extraTurn && winnerId === null ? Date.now() : state.turnStartTime,
    });

    // Move to next player if no extra turn (do this via setTimeout to allow UI to update)
    if (!extraTurn || winnerId !== null) {
      setTimeout(() => {
        const s = get();
        if (s.winnerId !== null) return; // game over, don't change turn
        set({
          currentPlayerIndex: (s.currentPlayerIndex + 1) % s.numPlayers,
          turnStartTime: Date.now(),
          turnPhase: 'throwing',
          extraTurns: 0,
        });
      }, 800);
    }
  },

  nextTurn: () => {
    const state = get();
    set({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.numPlayers,
      turnStartTime: Date.now(),
      turnPhase: 'throwing',
      currentYut: null,
      selectedPieceId: null,
      possibleMoves: [],
      extraTurns: 0,
    });
  },

  setTurnPhase: (turnPhase) => set({ turnPhase }),
  setShowYutAnimation: (showYutAnimation) => set({ showYutAnimation }),
  setLastMoveMessage: (lastMoveMessage) => set({ lastMoveMessage }),
  updateElapsed: () => {
    const { gameStartTime } = get();
    if (!gameStartTime) return;
    set({ totalElapsedMs: Date.now() - gameStartTime });
  },
}));

export { PLAYER_COLORS };
