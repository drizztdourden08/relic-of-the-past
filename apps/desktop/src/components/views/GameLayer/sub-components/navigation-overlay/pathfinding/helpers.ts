import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos, Rect } from '../types';

export const PATH_DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function keyOf(pos: GridPos): string {
  return `${pos.row},${pos.col}`;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function segmentOverlapsRect(a: { x: number; y: number }, b: { x: number; y: number }, rect: Rect, margin: number): boolean {
  const minX = rect.x - margin;
  const maxX = rect.x + rect.w + margin;
  const minY = rect.y - margin;
  const maxY = rect.y + rect.h + margin;

  if (Math.abs(a.y - b.y) < 0.001) {
    const y = a.y;
    if (y < minY || y > maxY) return false;
    const sx1 = Math.min(a.x, b.x);
    const sx2 = Math.max(a.x, b.x);
    return sx2 >= minX && sx1 <= maxX;
  }

  if (Math.abs(a.x - b.x) < 0.001) {
    const x = a.x;
    if (x < minX || x > maxX) return false;
    const sy1 = Math.min(a.y, b.y);
    const sy2 = Math.max(a.y, b.y);
    return sy2 >= minY && sy1 <= maxY;
  }

  return false;
}

/** Check whether a 2×2 block (top-left at row,col) is fully reachable (player can stop here). */
export function isValid2x2(row: number, col: number, reachable: ReachState[][]): boolean {
  if (row < 0 || row + 1 >= 64 || col < 0 || col + 1 >= 64) return false;
  return reachable[row][col] === 1 && reachable[row][col + 1] === 1 &&
         reachable[row + 1][col] === 1 && reachable[row + 1][col + 1] === 1;
}

/** Check if movement direction (dr,dc) is compatible with an encoded traversal state (>=2). */
export function isTraversalDirCompatible(state: number, dr: number, dc: number): boolean {
  switch (state) {
    case 2: return dr === 1 && dc === 0;   // south
    case 3: return dr === -1 && dc === 0;  // north
    case 4: return dc === 1 && dr === 0;   // east
    case 5: return dc === -1 && dr === 0;  // west
    case 6: return dr === 1 || dc === 1;   // se
    case 7: return dr === 1 || dc === -1;  // sw
    case 8: return dr === -1 || dc === 1;  // ne
    case 9: return dr === -1 || dc === -1; // nw
    case 10: return true;                  // stairs — bidirectional
    default: return false;
  }
}

/** Check if a 2×2 move in direction (dr,dc) is valid — allows traversal tiles in their permitted direction. */
export function isValidMove2x2(
  nr: number, nc: number, dr: number, dc: number,
  reachable: ReachState[][],
): boolean {
  if (nr < 0 || nr + 1 >= 64 || nc < 0 || nc + 1 >= 64) return false;
  const positions: [number, number][] = [[nr, nc], [nr, nc + 1], [nr + 1, nc], [nr + 1, nc + 1]];
  for (const [r, c] of positions) {
    const state = reachable[r][c];
    if (state === 0) return false;
    if (state >= 2) {
      if (!isTraversalDirCompatible(state, dr, dc)) return false;
    }
  }
  return true;
}

/** Check if the body at (row,col) can leave in direction (dr,dc) — ledge tiles restrict exit direction. */
export function canLeave2x2(
  row: number, col: number, dr: number, dc: number,
  reachable: ReachState[][],
): boolean {
  const positions: [number, number][] = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]];
  for (const [r, c] of positions) {
    const state = reachable[r]?.[c] ?? 0;
    // Ledge tiles (2-9) only allow leaving in their direction; stairs (10) allow any
    if (state >= 2 && state <= 9) {
      if (!isTraversalDirCompatible(state, dr, dc)) return false;
    }
  }
  return true;
}
