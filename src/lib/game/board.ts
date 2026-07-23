// Yut Nori board logic - 21 positions in a 5x5 grid layout

// Board coordinates (x, y) where (0,0) is bottom-left, (4,4) is top-right
export interface BoardCoord {
  x: number;
  y: number;
}

// All 21 positions on the board
// 0-15: outer ring (counterclockwise from bottom-right start)
// 16-19: diagonal midpoints
// 20: center
export const BOARD_POSITIONS: BoardCoord[] = [
  // Outer ring (counterclockwise)
  { x: 4, y: 0 }, // 0: bottom-right (START)
  { x: 3, y: 0 }, // 1
  { x: 2, y: 0 }, // 2
  { x: 1, y: 0 }, // 3
  { x: 0, y: 0 }, // 4: bottom-left corner
  { x: 0, y: 1 }, // 5
  { x: 0, y: 2 }, // 6
  { x: 0, y: 3 }, // 7
  { x: 0, y: 4 }, // 8: top-left corner
  { x: 1, y: 4 }, // 9
  { x: 2, y: 4 }, // 10
  { x: 3, y: 4 }, // 11
  { x: 4, y: 4 }, // 12: top-right corner
  { x: 4, y: 3 }, // 13
  { x: 4, y: 2 }, // 14
  { x: 4, y: 1 }, // 15
  // Diagonal midpoints
  { x: 3, y: 1 }, // 16: mid of diagonal 0→8 (closer to 0)
  { x: 1, y: 3 }, // 17: mid of diagonal 0→8 (closer to 8)
  { x: 1, y: 1 }, // 18: mid of diagonal 4→12 (closer to 4)
  { x: 3, y: 3 }, // 19: mid of diagonal 4→12 (closer to 12)
  // Center
  { x: 2, y: 2 }, // 20: center
];

// Corners where diagonal shortcuts can be taken
export const CORNER_POSITIONS = [0, 4, 8, 12];

// Path type tracking for each piece
// 'outer' = on outer ring
// 'd0' = on diagonal from corner 0 going up-left
// 'd4' = on diagonal from corner 4 going up-right
// 'd8' = on diagonal from corner 8 going down-right
// 'd12' = on diagonal from corner 12 going down-left
export type PathType = 'outer' | 'd0' | 'd4' | 'd8' | 'd12';

// Next position lookup: `${pos}_${pathType}` → next position
const NEXT_MAP: Record<string, number> = {
  // Outer ring (counterclockwise)
  '0_outer': 1, '1_outer': 2, '2_outer': 3, '3_outer': 4,
  '4_outer': 5, '5_outer': 6, '6_outer': 7, '7_outer': 8,
  '8_outer': 9, '9_outer': 10, '10_outer': 11, '11_outer': 12,
  '12_outer': 13, '13_outer': 14, '14_outer': 15, '15_outer': 0,

  // Diagonal 0 → 8 (up-left): 0 → 16 → 20 → 17 → 8
  '0_d0': 16, '16_d0': 20, '20_d0': 17, '17_d0': 8,

  // Diagonal 4 → 12 (up-right): 4 → 18 → 20 → 19 → 12
  '4_d4': 18, '18_d4': 20, '20_d4': 19, '19_d4': 12,

  // Diagonal 8 → 0 (down-right): 8 → 17 → 20 → 16 → 0
  '8_d8': 17, '17_d8': 20, '20_d8': 16, '16_d8': 0,

  // Diagonal 12 → 4 (down-left): 12 → 19 → 20 → 18 → 4
  '12_d12': 19, '19_d12': 20, '20_d12': 18, '18_d12': 4,
};

// Backward move map (for Back-Do)
const PREV_MAP: Record<string, number> = {
  // Outer ring (clockwise = backward)
  '0_outer': 15, '1_outer': 0, '2_outer': 1, '3_outer': 2,
  '4_outer': 3, '5_outer': 4, '6_outer': 5, '7_outer': 6,
  '8_outer': 7, '9_outer': 8, '10_outer': 9, '11_outer': 10,
  '12_outer': 11, '13_outer': 12, '14_outer': 13, '15_outer': 14,
  // Backward on diagonals (rarely used but supported)
  '16_d0': 0, '20_d0': 16, '17_d0': 20,
  '18_d4': 4, '20_d4': 18, '19_d4': 20,
  '17_d8': 8, '20_d8': 17, '16_d8': 20,
  '19_d12': 12, '20_d12': 19, '18_d12': 20,
};

// Diagonal entries: from corner → diagonal path type
const DIAGONAL_ENTRY: Record<number, PathType> = {
  0: 'd0',
  4: 'd4',
  8: 'd8',
  12: 'd12',
};

// When arriving at a corner via a diagonal, switch back to outer
// Diagonal 0→8 ends at 8 → outer
// Diagonal 4→12 ends at 12 → outer
// Diagonal 8→0 ends at 0 → finish (or outer)
// Diagonal 12→4 ends at 4 → outer

export interface MoveOption {
  position: number;
  pathType: PathType;
  isDiagonalChoice: boolean; // true if this is the diagonal option at a corner
  isFinish: boolean;
}

// Get the next position after moving from a corner along a path
function step(currentPos: number, currentPath: PathType, goingBackward: boolean = false): { pos: number; path: PathType; finished: boolean } | null {
  const key = `${currentPos}_${currentPath}`;
  const next = goingBackward ? PREV_MAP[key] : NEXT_MAP[key];
  if (next === undefined) return null;

  // Check if we just returned to start (position 0) and we're going forward
  // That means the piece has completed the loop
  if (!goingBackward && next === 0 && currentPath === 'outer') {
    // Arriving back at start = finished
    return { pos: 0, path: 'outer', finished: true };
  }

  // Check if next is a corner (end of diagonal)
  // If we were on a diagonal and arrived at the opposite corner, switch to outer
  if ((currentPath === 'd0' && next === 8) ||
      (currentPath === 'd4' && next === 12) ||
      (currentPath === 'd8' && next === 0)) {
    // Arrived at end of diagonal, back to outer
    // If next is 0, that's the finish
    if (next === 0) {
      return { pos: 0, path: 'outer', finished: true };
    }
    return { pos: next, path: 'outer', finished: false };
  }
  if (currentPath === 'd12' && next === 4) {
    return { pos: next, path: 'outer', finished: false };
  }

  // Continue on same path
  return { pos: next, path: currentPath, finished: false };
}

// Calculate all possible moves from a given position with given steps
// Returns array of options (1 or 2 if at a corner with diagonal choice)
export function getPossibleMoves(
  startPos: number,
  startPath: PathType,
  steps: number,
): MoveOption[] {
  if (steps === 0) {
    return [{ position: startPos, pathType: startPath, isDiagonalChoice: false, isFinish: false }];
  }

  const goingBackward = steps < 0;
  const absSteps = Math.abs(steps);

  // Two paths to consider if at a corner with outer path going forward
  const isAtCorner = CORNER_POSITIONS.includes(startPos);
  const canTakeDiagonal = isAtCorner && startPath === 'outer' && !goingBackward;

  const paths: PathType[] = canTakeDiagonal
    ? [startPath, DIAGONAL_ENTRY[startPos]]
    : [startPath];

  const options: MoveOption[] = [];

  for (const path of paths) {
    let currentPos = startPos;
    let currentPath: PathType = path;
    let finished = false;

    for (let i = 0; i < absSteps; i++) {
      const result = step(currentPos, currentPath, goingBackward);
      if (!result) {
        // Invalid move (e.g., backward from start)
        finished = true;
        break;
      }
      currentPos = result.pos;
      currentPath = result.path;
      finished = result.finished;

      // If finished mid-way, we're done
      if (finished && i === absSteps - 1) break;
      if (finished && i < absSteps - 1) {
        // Overshoot - piece is finished but with extra steps
        // In Yut Nori, this is typically allowed (piece is finished)
        break;
      }
    }

    options.push({
      position: currentPos,
      pathType: currentPath,
      isDiagonalChoice: path !== startPath,
      isFinish: finished,
    });
  }

  return options;
}

// Get the position coordinates for rendering
export function getPositionCoord(pos: number): BoardCoord {
  return BOARD_POSITIONS[pos] ?? { x: 2, y: 2 };
}

// Check if a position is a corner
export function isCorner(pos: number): boolean {
  return CORNER_POSITIONS.includes(pos);
}

// Check if a position is the center
export function isCenter(pos: number): boolean {
  return pos === 20;
}

// Roll the yut sticks and return the result
export function rollYut(): YutThrowResult {
  // 4 sticks, each with a front (round side up = true) and back (flat side up = false)
  // Standard Yut Nori: 1 back-do stick (special), but simplified version uses regular sticks
  const sticks = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
  // sticks[i] = true means "front" (round side up) which counts as 1
  const frontCount = sticks.filter(s => s).length;

  // Determine result
  // 0 front = Mo (5 steps + extra turn) - all sticks show back
  // 1 front = Do (1 step) - but if the special "back-do" stick is the only front, it's back-do (-1)
  // 2 front = Gae (2 steps)
  // 3 front = Geol (3 steps)
  // 4 front = Yut (4 steps + extra turn)
  let result: YutResultType;
  let steps: number;
  let extraTurn = false;

  switch (frontCount) {
    case 0:
      result = 'mo';
      steps = 5;
      extraTurn = true;
      break;
    case 1:
      // 12.5% chance it's back-do (the special stick is the only front)
      // Simplified: just regular Do
      result = 'do';
      steps = 1;
      break;
    case 2:
      result = 'gae';
      steps = 2;
      break;
    case 3:
      result = 'geol';
      steps = 3;
      break;
    case 4:
      result = 'yut';
      steps = 4;
      extraTurn = true;
      break;
    default:
      result = 'do';
      steps = 1;
  }

  // Back-do: 1/4 chance when only 1 stick is front (simplified)
  // Actually let's make back-do just 1 front (since that's how it works in many simplified versions)
  // But to keep it simple and have some back-dos, let's make 0 fronts also have a small chance
  // For better gameplay, let's use the traditional probability:
  // - Do: 25% (1 front)
  // - Gae: 37.5% (2 front)
  // - Geol: 25% (3 front)
  // - Yut: 6.25% (4 front)
  // - Mo: 6.25% (0 front)
  // - Back-do: rare, let's make it ~5% of all throws

  // Actually, in real Yut Nori, one stick has a special back-do marking.
  // Let's redo this: stick 0 is the special "back-do" stick.
  // If only stick 0 is front (and others are back), it's back-do.
  // Otherwise, count the fronts normally.
  // front = up = true (round side)
  // But traditionally: back = up = true (flat side) means... actually
  // In Yut Nori, the sticks are split into two halves along their length.
  // One half is round (front/face), the other is flat (back).
  // When thrown, the round side UP means "face up" = 1 point.
  // Back-do is when only the special stick (with marking) is face DOWN and others are face UP.
  // Or vice versa - it varies.

  // Simplified version: just use random with proper probabilities
  // Reset:
  const r = Math.random();
  if (r < 0.07) {
    // Back-do
    return {
      result: 'back-do',
      sticks: [true, false, false, false], // special stick front, others back
      steps: -1,
      extraTurn: false,
    };
  } else if (r < 0.32) {
    // Do
    return {
      result: 'do',
      sticks: [true, false, false, false].sort(() => Math.random() - 0.5),
      steps: 1,
      extraTurn: false,
    };
  } else if (r < 0.69) {
    // Gae
    return {
      result: 'gae',
      sticks: [true, true, false, false].sort(() => Math.random() - 0.5),
      steps: 2,
      extraTurn: false,
    };
  } else if (r < 0.94) {
    // Geol
    return {
      result: 'geol',
      sticks: [true, true, true, false].sort(() => Math.random() - 0.5),
      steps: 3,
      extraTurn: false,
    };
  } else {
    // Yut (4%) and Mo (6%) - adjusted slightly
    if (r < 0.97) {
      return {
        result: 'yut',
        sticks: [true, true, true, true],
        steps: 4,
        extraTurn: true,
      };
    } else {
      return {
        result: 'mo',
        sticks: [false, false, false, false],
        steps: 5,
        extraTurn: true,
      };
    }
  }
}

// Type alias to avoid import issues
type YutResultType = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'back-do';
type YutThrowResult = {
  result: YutResultType;
  sticks: boolean[];
  steps: number;
  extraTurn: boolean;
};
