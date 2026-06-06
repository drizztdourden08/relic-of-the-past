import type { GridPos } from '../types';
import { GRID_SIZE } from '../types';

const DIRECTIONS: readonly [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/** Check if a position is within the 64x64 grid bounds. */
function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

/** Get valid 4-directional neighbors within bounds. */
function getNeighbors(row: number, col: number): GridPos[] {
  const neighbors: GridPos[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (inBounds(nr, nc)) neighbors.push({ row: nr, col: nc });
  }
  return neighbors;
}

/** Manhattan distance between two grid positions. */
function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/** Get the adjacent overworld screen index for a given edge. Overworld is 8×8 grid; LW = 0x00–0x3F, DW = 0x40–0x7F. */
function getAdjacentScreen(screenIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null {
  const col = screenIdx & 7;
  const row = (screenIdx >> 3) & 7;
  const world = screenIdx & 0x40;
  switch (edge) {
    case 'north': return row > 0 ? world | ((row - 1) << 3) | col : null;
    case 'south': return row < 7 ? world | ((row + 1) << 3) | col : null;
    case 'west': return col > 0 ? world | (row << 3) | (col - 1) : null;
    case 'east': return col < 7 ? world | (row << 3) | (col + 1) : null;
  }
}

/**
 * Check 2-tile perpendicular clearance for Link's 16px width.
 * Returns true if at least one adjacent perpendicular tile is passable.
 */
function has2TileClearance(
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

export { DIRECTIONS, inBounds, getNeighbors, manhattan, getAdjacentScreen, has2TileClearance };
