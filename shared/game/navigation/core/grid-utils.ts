import type { GridPos } from '../types';
import { GRID_SIZE } from '../types';

export const DIRECTIONS: readonly [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/** Check if a position is within the 64x64 grid bounds. */
export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

/** Get valid 4-directional neighbors within bounds. */
export function getNeighbors(row: number, col: number): GridPos[] {
  const neighbors: GridPos[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (inBounds(nr, nc)) neighbors.push({ row: nr, col: nc });
  }
  return neighbors;
}

/** Manhattan distance between two grid positions. */
export function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Check 2-tile perpendicular clearance for Link's 16px width.
 * Returns true if at least one adjacent perpendicular tile is passable.
 */
export function has2TileClearance(
  row: number,
  col: number,
  dr: number,
  dc: number,
  isPassable: (r: number, c: number) => boolean,
): boolean {
  if (dr !== 0) {
    // Moving vertically — check horizontal clearance
    if (col > 0 && isPassable(row, col - 1)) return true;
    if (col < GRID_SIZE - 1 && isPassable(row, col + 1)) return true;
  } else {
    // Moving horizontally — check vertical clearance
    if (row > 0 && isPassable(row - 1, col)) return true;
    if (row < GRID_SIZE - 1 && isPassable(row + 1, col)) return true;
  }
  return false;
}
