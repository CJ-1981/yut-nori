import { Player, Piece } from '../src/lib/game/types';

const mockPlayers: Player[] = Array.from({ length: 4 }, (_, p) => ({
  id: p,
  name: `Player ${p}`,
  avatarId: 'tiger',
  isAI: false,
  pieces: Array.from({ length: 4 }, (_, i) => ({
    id: `p${p}_${i}`,
    playerId: p,
    position: i % 2 === 0 ? 0 : -1,
    carrying: i === 0 ? [`p${p}_2`] : [],
  })),
}));

export function baseline(players: Player[]) {
  const allPieces: any[] = [];
  for (const player of players) {
    for (const piece of player.pieces) {
      if (piece.position === -2) continue;
      const isCarried =
        players
          .find((p) => p.id === player.id)
          ?.pieces.some((p) => p.carrying.includes(piece.id)) ?? false;
      const piecesAtSamePos = player.pieces.filter(
        (p) => p.position === piece.position && p.position >= 0
      );
      const stackIndex = piecesAtSamePos.findIndex((p) => p.id === piece.id);
      allPieces.push({
        pieceId: piece.id,
        playerId: piece.playerId,
        position: piece.position,
        isCarried,
        stackIndex: stackIndex >= 0 ? stackIndex : 0,
        stackSize: piece.position >= 0 ? piecesAtSamePos.length : 1,
      });
    }
  }
  return allPieces;
}

export function optimized(players: Player[]) {
  const allPieces: any[] = [];
  for (const player of players) {
    const carriedSet = new Set<string>();
    const posMap = new Map<number, Piece[]>();
    for (const p of player.pieces) {
      if (p.carrying) {
        for (let i = 0; i < p.carrying.length; i++) {
          carriedSet.add(p.carrying[i]);
        }
      }
      if (p.position >= 0) {
        let list = posMap.get(p.position);
        if (!list) {
          list = [];
          posMap.set(p.position, list);
        }
        list.push(p);
      }
    }

    for (const piece of player.pieces) {
      if (piece.position === -2) continue;
      const isCarried = carriedSet.has(piece.id);
      let stackIndex = 0;
      let stackSize = 1;
      if (piece.position >= 0) {
        const piecesAtSamePos = posMap.get(piece.position);
        if (piecesAtSamePos) {
          stackSize = piecesAtSamePos.length;
          stackIndex = piecesAtSamePos.indexOf(piece);
          if (stackIndex < 0) stackIndex = 0;
        }
      }
      allPieces.push({
        pieceId: piece.id,
        playerId: piece.playerId,
        position: piece.position,
        isCarried,
        stackIndex,
        stackSize,
      });
    }
  }
  return allPieces;
}

if (import.meta.main || process.argv[1]?.endsWith('benchmark-yutboard.ts')) {
  // Warm up
  for (let i = 0; i < 10000; i++) {
    baseline(mockPlayers);
    optimized(mockPlayers);
  }

  const N = 500000;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) baseline(mockPlayers);
  const t1 = performance.now();

  const t2 = performance.now();
  for (let i = 0; i < N; i++) optimized(mockPlayers);
  const t3 = performance.now();

  const baselineMs = t1 - t0;
  const optMs = t3 - t2;

  console.log(`Baseline: ${baselineMs.toFixed(2)} ms (${(N / baselineMs * 1000).toFixed(0)} ops/sec)`);
  console.log(`Optimized: ${optMs.toFixed(2)} ms (${(N / optMs * 1000).toFixed(0)} ops/sec)`);
  console.log(`Speedup: ${(baselineMs / optMs).toFixed(2)}x faster (${((baselineMs - optMs) / baselineMs * 100).toFixed(1)}% reduction in runtime)`);
}
