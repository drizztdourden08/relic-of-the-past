/* @layer shared-game @kind logic */
import type { GridPos } from '../types';
import { GRID_SIZE } from '../types';

const DIRECTIONS: readonly [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const inBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
};

const getNeighbors = (row: number, col: number): GridPos[] => {
  const neighbors: GridPos[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (inBounds(nr, nc)) neighbors.push({ row: nr, col: nc });
  }
  return neighbors;
};

const manhattan = (a: GridPos, b: GridPos): number => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

const getAdjacentScreen = (screenIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null => {
  const col = screenIdx & 7;
  const row = (screenIdx >> 3) & 7;
  const world = screenIdx & 0x40;
  switch (edge) {
    case 'north': return row > 0 ? world | ((row - 1) << 3) | col : null;
    case 'south': return row < 7 ? world | ((row + 1) << 3) | col : null;
    case 'west': return col > 0 ? world | (row << 3) | (col - 1) : null;
    case 'east': return col < 7 ? world | (row << 3) | (col + 1) : null;
  }
};

const has2TileClearance = (row: number, col: number, dr: number, dc: number, isPassable: (r: number, c: number) => boolean): boolean => {
  if (dr !== 0) {
    // Moving vertically, so check horizontal clearance
    if (col > 0 && isPassable(row, col - 1)) return true;
    if (col < GRID_SIZE - 1 && isPassable(row, col + 1)) return true;
  } else {
    // Moving horizontally, so check vertical clearance
    if (row > 0 && isPassable(row - 1, col)) return true;
    if (row < GRID_SIZE - 1 && isPassable(row + 1, col)) return true;
  }
  return false;
};

export { DIRECTIONS, inBounds, getNeighbors, manhattan, getAdjacentScreen, has2TileClearance };
