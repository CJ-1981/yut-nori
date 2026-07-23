// Yut Nori board logic - 6x6 grid (coordinates 0-5)
// Outer ring: 5 steps between corners (Mo reaches next corner)
// Diagonals: 6 steps between corners (7 points including center)

export interface BoardCoord {
  x: number;
  y: number;
}

// All 29 positions on the board
// 0-19: outer ring (counterclockwise from bottom-right start)
// 20: center (shared by both diagonals)
// 21-24: diagonal A points (corner 0 → center → corner 10), 2 on each side
// 25-28: diagonal B points (corner 5 → center → corner 15), 2 on each side
export const BOARD_POSITIONS: BoardCoord[] = [
  // Outer ring (counterclockwise: bottom-right → up → left → down → right)
  { x: 5, y: 0 }, // 0: bottom-right (START)
  { x: 5, y: 1 }, // 1: going UP along right side
  { x: 5, y: 2 }, // 2
  { x: 5, y: 3 }, // 3
  { x: 5, y: 4 }, // 4
  { x: 5, y: 5 }, // 5: top-right corner
  { x: 4, y: 5 }, // 6: going LEFT along top
  { x: 3, y: 5 }, // 7
  { x: 2, y: 5 }, // 8
  { x: 1, y: 5 }, // 9
  { x: 0, y: 5 }, // 10: top-left corner
  { x: 0, y: 4 }, // 11: going DOWN along left side
  { x: 0, y: 3 }, // 12
  { x: 0, y: 2 }, // 13
  { x: 0, y: 1 }, // 14
  { x: 0, y: 0 }, // 15: bottom-left corner
  { x: 1, y: 0 }, // 16: going RIGHT along bottom
  { x: 2, y: 0 }, // 17
  { x: 3, y: 0 }, // 18
  { x: 4, y: 0 }, // 19
  // Center (shared by both diagonals) at (2.5, 2.5)
  { x: 2.5, y: 2.5 }, // 20: center
  // Diagonal A: corner 0(5,0) → 21 → 22 → center(20) → 23 → 24 → corner 10(0,5)
  { x: 4.17, y: 0.83 }, // 21
  { x: 3.33, y: 1.67 }, // 22
  { x: 1.67, y: 3.33 }, // 23
  { x: 0.83, y: 4.17 }, // 24
  // Diagonal B: corner 5(5,5) → 25 → 26 → center(20) → 27 → 28 → corner 15(0,0)
  { x: 4.17, y: 4.17 }, // 25
  { x: 3.33, y: 3.33 }, // 26
  { x: 1.67, y: 1.67 }, // 27
  { x: 0.83, y: 0.83 }, // 28
];

// Corners where diagonal shortcuts can be taken
export const CORNER_POSITIONS = [0, 5, 10, 15];

// Center position
export const CENTER_POSITION = 20;

// Path type tracking for each piece
export type PathType = 'outer' | 'd0' | 'd5' | 'd10' | 'd15';

// Next position lookup: `${pos}_${pathType}` → next position
// Outer ring: 5 intervals per side (counterclockwise)
// Diagonals: 6 intervals each (7 points: corner → 2 points → center → 2 points → corner)
const NEXT_MAP: Record<string, number> = {
  // Outer ring (counterclockwise)
  '0_outer': 1, '1_outer': 2, '2_outer': 3, '3_outer': 4, '4_outer': 5,
  '5_outer': 6, '6_outer': 7, '7_outer': 8, '8_outer': 9, '9_outer': 10,
  '10_outer': 11, '11_outer': 12, '12_outer': 13, '13_outer': 14, '14_outer': 15,
  '15_outer': 16, '16_outer': 17, '17_outer': 18, '18_outer': 19, '19_outer': 0,

  // Diagonal A: 0 → 21 → 22 → 20(center) → 23 → 24 → 10
  '0_d0': 21, '21_d0': 22, '22_d0': 20, '20_d0': 23, '23_d0': 24, '24_d0': 10,
  // Diagonal A reverse: 10 → 24 → 23 → 20(center) → 22 → 21 → 0
  '10_d10': 24, '24_d10': 23, '23_d10': 20, '20_d10': 22, '22_d10': 21, '21_d10': 0,

  // Diagonal B: 5 → 25 → 26 → 20(center) → 27 → 28 → 15
  '5_d5': 25, '25_d5': 26, '26_d5': 20, '20_d5': 27, '27_d5': 28, '28_d5': 15,
  // Diagonal B reverse: 15 → 28 → 27 → 20(center) → 26 → 25 → 5
  '15_d15': 28, '28_d15': 27, '27_d15': 20, '20_d15': 26, '26_d15': 25, '25_d15': 5,
};

// Backward move map (for Back-Do) - reverse of NEXT_MAP
const PREV_MAP: Record<string, number> = {
  // Outer ring (backward = clockwise)
  '0_outer': 19, '1_outer': 0, '2_outer': 1, '3_outer': 2, '4_outer': 3,
  '5_outer': 4, '6_outer': 5, '7_outer': 6, '8_outer': 7, '9_outer': 8,
  '10_outer': 9, '11_outer': 10, '12_outer': 11, '13_outer': 12, '14_outer': 13,
  '15_outer': 14, '16_outer': 15, '17_outer': 16, '18_outer': 17, '19_outer': 18,
  // Diagonal A backward
  '21_d0': 0, '22_d0': 21, '20_d0': 22, '23_d0': 20, '24_d0': 23, '10_d0': 24,
  '24_d10': 10, '23_d10': 24, '20_d10': 23, '22_d10': 20, '21_d10': 22, '0_d10': 21,
  // Diagonal B backward
  '25_d5': 5, '26_d5': 25, '20_d5': 26, '27_d5': 20, '28_d5': 27, '15_d5': 28,
  '28_d15': 15, '27_d15': 28, '20_d15': 27, '26_d15': 20, '25_d15': 26, '5_d15': 25,
};

// Diagonal entries: from corner → diagonal path type
const DIAGONAL_ENTRY: Record<number, PathType> = {
  0: 'd0',
  5: 'd5',
  10: 'd10',
  15: 'd15',
};

export interface MoveOption {
  position: number;
  pathType: PathType;
  isDiagonalChoice: boolean;
  isFinish: boolean;
}

// Get the next position after moving from current position along a path
function step(currentPos: number, currentPath: PathType, goingBackward: boolean = false): { pos: number; path: PathType; finished: boolean } | null {
  const key = `${currentPos}_${currentPath}`;
  const next = goingBackward ? PREV_MAP[key] : NEXT_MAP[key];
  if (next === undefined) return null;

  // Check if we returned to start (position 0) going forward on outer = finished
  if (!goingBackward && next === 0 && currentPath === 'outer') {
    return { pos: 0, path: 'outer', finished: true };
  }

  // Check if we arrived at a corner via a diagonal - switch to outer
  // Diagonal d0 ends at corner 10
  if (currentPath === 'd0' && next === 10) {
    return { pos: 10, path: 'outer', finished: false };
  }
  // Diagonal d10 ends at corner 0 = finish
  if (currentPath === 'd10' && next === 0) {
    return { pos: 0, path: 'outer', finished: true };
  }
  // Diagonal d5 ends at corner 15
  if (currentPath === 'd5' && next === 15) {
    return { pos: 15, path: 'outer', finished: false };
  }
  // Diagonal d15 ends at corner 5
  if (currentPath === 'd15' && next === 5) {
    return { pos: 5, path: 'outer', finished: false };
  }

  // Continue on same path
  return { pos: next, path: currentPath, finished: false };
}

// Calculate all possible moves from a given position with given steps
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
        finished = true;
        break;
      }
      currentPos = result.pos;
      currentPath = result.path;
      finished = result.finished;

      if (finished) break;
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
  return BOARD_POSITIONS[pos] ?? { x: 2.5, y: 2.5 };
}

// Check if a position is a corner
export function isCorner(pos: number): boolean {
  return CORNER_POSITIONS.includes(pos);
}

// Check if a position is the center
export function isCenter(pos: number): boolean {
  return pos === CENTER_POSITION;
}

// Check if a position is a diagonal intermediate point
export function isDiagonalPoint(pos: number): boolean {
  return (pos >= 21 && pos <= 28);
}

// Roll the yut sticks and return the result
export function rollYut(): YutThrowResult {
  const r = Math.random();
  if (r < 0.07) {
    return {
      result: 'back-do',
      sticks: [true, false, false, false],
      steps: -1,
      extraTurn: false,
    };
  } else if (r < 0.32) {
    return {
      result: 'do',
      sticks: [true, false, false, false].sort(() => Math.random() - 0.5),
      steps: 1,
      extraTurn: false,
    };
  } else if (r < 0.69) {
    return {
      result: 'gae',
      sticks: [true, true, false, false].sort(() => Math.random() - 0.5),
      steps: 2,
      extraTurn: false,
    };
  } else if (r < 0.94) {
    return {
      result: 'geol',
      sticks: [true, true, true, false].sort(() => Math.random() - 0.5),
      steps: 3,
      extraTurn: false,
    };
  } else {
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

type YutResultType = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'back-do';
type YutThrowResult = {
  result: YutResultType;
  sticks: boolean[];
  steps: number;
  extraTurn: boolean;
};
