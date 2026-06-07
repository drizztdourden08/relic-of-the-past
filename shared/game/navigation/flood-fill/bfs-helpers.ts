/* @layer shared-game @kind logic */
/** Shared primitives for the single/dual-layer flood-fill BFS (2×2 body model). */
import type { TilePassability, TransitionPoint } from '../types';
import { GRID_SIZE } from '../types';

interface QuadrantBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

/** Swap-layer stair tile attrs (bidirectional layer transitions). */
const SWAP_STAIR_ATTRS = new Set([0x1E, 0x1F, 0x3E, 0x3F]);

const bodyTiles = (r: number, c: number): [number, number][] => {
  return [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
};

const getNewTiles = (nr: number, nc: number, dr: number, dc: number): [number, number][] => {
  if (dr === -1) return [[nr, nc], [nr, nc + 1]];       // north: new top row
  if (dr === 1) return [[nr + 1, nc], [nr + 1, nc + 1]]; // south: new bottom row
  if (dc === -1) return [[nr, nc], [nr + 1, nc]];       // west: new left column
  return [[nr, nc + 1], [nr + 1, nc + 1]];              // east: new right column
};

const isBodyPassable = (r: number, c: number, grid: TilePassability[][], inventory: Set<string>): boolean => {
  for (const [tr, tc] of bodyTiles(r, c)) {
    const t = grid[tr][tc];
    if (t.type === 'blocked') return false;
    if (t.type === 'obstacle' && !inventory.has(t.req!)) return false;
    if (t.type === 'water' && !inventory.has('flippers')) return false;
  }
  return true;
};

const findStartBody = (row: number, col: number, grid: TilePassability[][], inventory: Set<string>, minR: number, maxR: number, minC: number, maxC: number): { row: number; col: number } | null => {
  // Try all 4 possible body positions that include (row, col)
  const candidates: [number, number][] = [
    [row, col], [row, col - 1], [row - 1, col], [row - 1, col - 1],
  ];
  for (const [r, c] of candidates) {
    if (r < minR || r + 1 > maxR || c < minC || c + 1 > maxC) continue;
    if (isBodyPassable(r, c, grid, inventory)) return { row: r, col: c };
  }
  // Spiral outward to find nearest valid body position
  for (let dist = 1; dist < GRID_SIZE; dist++) {
    for (let dr = -dist; dr <= dist; dr++) {
      for (let dc = -dist; dc <= dist; dc++) {
        if (Math.abs(dr) !== dist && Math.abs(dc) !== dist) continue;
        const r = row + dr;
        const c = col + dc;
        if (r < minR || r + 1 > maxR || c < minC || c + 1 > maxC) continue;
        if (isBodyPassable(r, c, grid, inventory)) return { row: r, col: c };
      }
    }
  }
  return null;
};

const recordBorderTransition = (row: number, col: number, requirements: Set<string>, foundBorders: Set<string>, transitions: TransitionPoint[], minR: number, maxR: number, minC: number, maxC: number): void => {
  if (row === minR) {
    const key = `north-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'north', requirements: [...requirements] }); }
  }
  if (row === maxR) {
    const key = `south-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'south', requirements: [...requirements] }); }
  }
  if (col === minC) {
    const key = `west-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'west', requirements: [...requirements] }); }
  }
  if (col === maxC) {
    const key = `east-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'east', requirements: [...requirements] }); }
  }
};

const canLeaveLedge = (dir: string, dr: number, dc: number): boolean => {
  return (
    (dir === 's' && dr === 1) ||
    (dir === 'n' && dr === -1) ||
    (dir === 'e' && dc === 1) ||
    (dir === 'w' && dc === -1) ||
    (dir === 'ne' && (dr === -1 || dc === 1)) ||
    (dir === 'nw' && (dr === -1 || dc === -1)) ||
    (dir === 'se' && (dr === 1 || dc === 1)) ||
    (dir === 'sw' && (dr === 1 || dc === -1))
  );
};

const evaluateEntry = (tile: TilePassability, dr: number, dc: number, requirements: Set<string>, inventory: Set<string>): { canEnter: boolean; newReqs: Set<string> } => {
  let newReqs = requirements;

  switch (tile.type) {
    case 'free':
    case 'pit':
    case 'stairs':
      return { canEnter: true, newReqs };

    case 'obstacle':
      if (!inventory.has(tile.req)) return { canEnter: false, newReqs };
      if (!requirements.has(tile.req)) { newReqs = new Set(requirements); newReqs.add(tile.req); }
      return { canEnter: true, newReqs };

    case 'water':
      if (!inventory.has('flippers')) return { canEnter: false, newReqs };
      if (!requirements.has('flippers')) { newReqs = new Set(requirements); newReqs.add('flippers'); }
      return { canEnter: true, newReqs };

    case 'ledge':
      const canEnter =
        (tile.dir === 's' && dr === 1) || (tile.dir === 'n' && dr === -1) ||
        (tile.dir === 'e' && dc === 1) || (tile.dir === 'w' && dc === -1) ||
        (tile.dir === 'ne' && (dr === -1 || dc === 1)) ||
        (tile.dir === 'nw' && (dr === -1 || dc === -1)) ||
        (tile.dir === 'se' && (dr === 1 || dc === 1)) ||
        (tile.dir === 'sw' && (dr === 1 || dc === -1));
      return { canEnter, newReqs };

    case 'blocked':
      return { canEnter: false, newReqs };
  }
};

export {
  SWAP_STAIR_ATTRS, bodyTiles, getNewTiles, isBodyPassable, findStartBody,
  recordBorderTransition, canLeaveLedge, evaluateEntry,
};
export type { QuadrantBounds };
