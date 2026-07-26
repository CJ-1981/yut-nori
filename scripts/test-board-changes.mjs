// Test the 3 board changes:
// 1. Click selected piece again to move (logic verified separately in YutBoard.tsx)
// 2. Center → BR diagonal: at center, can branch onto d10 path (→ BR corner)
// 3. BL corner (15) cannot take d15 diagonal entry

// Inline the relevant logic from board.ts
const CORNER_POSITIONS = [0, 5, 10, 15];
const CENTER_POSITION = 20;
const DIAGONAL_ENTRY = { 0: 'd0', 5: 'd5', 10: 'd10', 15: 'd15' };

const NEXT_MAP = {
  '0_outer': 1, '1_outer': 2, '2_outer': 3, '3_outer': 4, '4_outer': 5,
  '5_outer': 6, '6_outer': 7, '7_outer': 8, '8_outer': 9, '9_outer': 10,
  '10_outer': 11, '11_outer': 12, '12_outer': 13, '13_outer': 14, '14_outer': 15,
  '15_outer': 16, '16_outer': 17, '17_outer': 18, '18_outer': 19, '19_outer': 0,
  '0_d0': 21, '21_d0': 22, '22_d0': 20, '20_d0': 23, '23_d0': 24, '24_d0': 10,
  '10_d10': 24, '24_d10': 23, '23_d10': 20, '20_d10': 22, '22_d10': 21, '21_d10': 0,
  '5_d5': 25, '25_d5': 26, '26_d5': 20, '20_d5': 27, '27_d5': 28, '28_d5': 15,
  '15_d15': 28, '28_d15': 27, '27_d15': 20, '20_d15': 26, '26_d15': 25, '25_d15': 5,
};

function step(currentPos, currentPath, goingBackward = false) {
  // Forward only - simplified for test
  const key = `${currentPos}_${currentPath}`;
  const next = NEXT_MAP[key];
  if (next === undefined) return null;
  if (currentPath === 'd0' && next === 10) return { pos: 10, path: 'outer' };
  if (currentPath === 'd10' && next === 0) return { pos: 0, path: 'outer', finished: true };
  if (currentPath === 'd5' && next === 15) return { pos: 15, path: 'outer' };
  if (currentPath === 'd15' && next === 5) return { pos: 5, path: 'outer' };
  if (next === 0 && currentPath === 'outer') return { pos: 0, path: 'outer', finished: true };
  return { pos: next, path: currentPath };
}

function getPossibleMoves(startPos, startPath, steps) {
  if (steps === 0) return [{ position: startPos, pathType: startPath, isDiagonalChoice: false, isFinish: false }];
  const goingBackward = steps < 0;
  const absSteps = Math.abs(steps);

  const isAtCorner = CORNER_POSITIONS.includes(startPos);
  const isStartCorner = startPos === 0;
  const isBlockedCorner = startPos === 15;
  const canTakeDiagonal = isAtCorner && !isStartCorner && !isBlockedCorner && startPath === 'outer' && !goingBackward;

  const isAtCenter = startPos === CENTER_POSITION;
  const canBranchToBRDiagonal = isAtCenter && !goingBackward && startPath !== 'outer' && startPath !== 'd10';

  let paths;
  if (canTakeDiagonal) {
    paths = [startPath, DIAGONAL_ENTRY[startPos]];
  } else if (canBranchToBRDiagonal) {
    paths = [startPath, 'd10'];
  } else {
    paths = [startPath];
  }

  const options = [];
  for (const path of paths) {
    let currentPos = startPos;
    let currentPath = path;
    let finished = false;
    for (let i = 0; i < absSteps; i++) {
      const result = step(currentPos, currentPath, goingBackward);
      if (!result) { finished = true; break; }
      currentPos = result.pos;
      currentPath = result.path;
      finished = result.finished;
      if (finished) break;
    }
    options.push({ position: currentPos, pathType: currentPath, isDiagonalChoice: path !== startPath, isFinish: finished });
  }
  return options;
}

// === TESTS ===
let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; console.log(`  PASS: ${msg}`); }
  else { fail++; console.log(`  FAIL: ${msg}`); }
}

console.log("\n=== Change 2: Center → BR diagonal ===");

// Piece at center on d5 path (came from TR corner), rolls Do (1 step)
// Should have 2 options: continue d5 (→27) OR branch d10 (→22 toward BR)
{
  const moves = getPossibleMoves(20, 'd5', 1);
  console.log(`  Center on d5, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 2, "center on d5 has 2 options");
  assert(moves.some(m => m.position === 27 && m.pathType === 'd5'), "option 1: continue d5 → 27");
  assert(moves.some(m => m.position === 22 && m.pathType === 'd10'), "option 2: branch d10 → 22 (toward BR)");
}

// Piece at center on d15 path, rolls Do (1 step)
// Should have 2 options: continue d15 (→26) OR branch d10 (→22 toward BR)
{
  const moves = getPossibleMoves(20, 'd15', 1);
  console.log(`  Center on d15, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 2, "center on d15 has 2 options");
  assert(moves.some(m => m.position === 26 && m.pathType === 'd15'), "option 1: continue d15 → 26");
  assert(moves.some(m => m.position === 22 && m.pathType === 'd10'), "option 2: branch d10 → 22 (toward BR)");
}

// Piece at center on d0 path, rolls Do (1 step)
// Should have 2 options: continue d0 (→23 toward TL) OR branch d10 (→22 toward BR)
{
  const moves = getPossibleMoves(20, 'd0', 1);
  console.log(`  Center on d0, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 2, "center on d0 has 2 options (can reverse to BR)");
  assert(moves.some(m => m.position === 23 && m.pathType === 'd0'), "option 1: continue d0 → 23");
  assert(moves.some(m => m.position === 22 && m.pathType === 'd10'), "option 2: branch d10 → 22 (toward BR)");
}

// Piece at center on d10 path, rolls Do (1 step)
// Should have only 1 option: continue d10 (→22 toward BR) — d10 already goes to BR
{
  const moves = getPossibleMoves(20, 'd10', 1);
  console.log(`  Center on d10, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 1, "center on d10 has 1 option (already toward BR)");
  assert(moves[0].position === 22 && moves[0].pathType === 'd10', "continues d10 → 22 (toward BR)");
}

// Multi-step test: at center on d5, rolls Yut (4 steps) - can reach BR corner via d10
// d10 path: 20 → 22 → 21 → 0 (finish) - only 3 steps to BR corner
// so 4 steps would overshoot. Let's test 3 steps (Geol):
{
  const moves = getPossibleMoves(20, 'd5', 3);
  console.log(`  Center on d5, Geol(3): ${JSON.stringify(moves)}`);
  assert(moves.some(m => m.position === 0 && m.pathType === 'd10' && m.isFinish), "can reach BR corner (0) via d10 in 3 steps");
}

console.log("\n=== Change 3: BL corner (15) cannot take diagonal ===");

// Piece at BL corner (15) on outer, rolls Do (1 step)
// Should have ONLY 1 option: continue outer (→16). No d15 diagonal.
{
  const moves = getPossibleMoves(15, 'outer', 1);
  console.log(`  BL corner, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 1, "BL corner has only 1 option (no diagonal)");
  assert(moves[0].position === 16 && moves[0].pathType === 'outer', "must continue outer → 16");
  assert(!moves.some(m => m.pathType === 'd15'), "no d15 diagonal entry from BL corner");
}

// Piece at TR corner (5) on outer, rolls Do (1 step) - should still have diagonal option
{
  const moves = getPossibleMoves(5, 'outer', 1);
  console.log(`  TR corner, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 2, "TR corner still has 2 options (diagonal allowed)");
  assert(moves.some(m => m.position === 6 && m.pathType === 'outer'), "outer → 6");
  assert(moves.some(m => m.position === 25 && m.pathType === 'd5'), "d5 diagonal → 25");
}

// Piece at TL corner (10) on outer, rolls Do (1 step) - should still have diagonal option
{
  const moves = getPossibleMoves(10, 'outer', 1);
  console.log(`  TL corner, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 2, "TL corner still has 2 options (diagonal allowed)");
  assert(moves.some(m => m.position === 11 && m.pathType === 'outer'), "outer → 11");
  assert(moves.some(m => m.position === 24 && m.pathType === 'd10'), "d10 diagonal → 24");
}

// Piece at BR corner (0) on outer - still no diagonal (start corner rule)
{
  const moves = getPossibleMoves(0, 'outer', 1);
  console.log(`  BR corner, Do(1): ${JSON.stringify(moves)}`);
  assert(moves.length === 1, "BR corner has only 1 option (start corner, no diagonal)");
  assert(moves[0].position === 1 && moves[0].pathType === 'outer', "must continue outer → 1");
}

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
