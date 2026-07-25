/* @layer shared-game @kind logic */
import type { TilePassability } from '../types';
import { GRID_SIZE } from '../types';

const bodyTiles = (r: number, c: number): [number, number][] => {
  return [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
};

const getNewTiles = (nr: number, nc: number, dr: number, dc: number): [number, number][] => {
  if (dr === -1) return [[nr, nc], [nr, nc + 1]];       // north: new top row
  if (dr === 1) return [[nr + 1, nc], [nr + 1, nc + 1]]; // south: new bottom row
  if (dc === -1) return [[nr, nc], [nr + 1, nc]];       // west: new left column
  return [[nr, nc + 1], [nr + 1, nc + 1]];              // east: new right column
};

const findStartBody = (row: number, col: number, grid: TilePassability[][], inventory: Set<string>, minR: number, maxR: number, minC: number, maxC: number): { row: number; col: number } | null => {
  const candidates: [number, number][] = [
    [row, col], [row, col - 1], [row - 1, col], [row - 1, col - 1],
  ];
  for (const [r, c] of candidates) {
    if (r < minR || r + 1 > maxR || c < minC || c + 1 > maxC) continue;
    if (isBodyPassable(r, c, grid, inventory)) return { row: r, col: c };
  }
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

const isBodyPassable = (r: number, c: number, grid: TilePassability[][], inventory: Set<string>): boolean => {
  for (const [tr, tc] of bodyTiles(r, c)) {
    const t = grid[tr][tc];
    if (t.type === 'blocked') return false;
    if (t.type === 'obstacle' && !inventory.has(t.req!)) return false;
    if (t.type === 'water' && !inventory.has('flippers')) return false;
  }
  return true;
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

    case 'ledge': {
      const canEnter =
        (tile.dir === 's' && dr === 1) || (tile.dir === 'n' && dr === -1) ||
        (tile.dir === 'e' && dc === 1) || (tile.dir === 'w' && dc === -1) ||
        (tile.dir === 'ne' && (dr === -1 || dc === 1)) ||
        (tile.dir === 'nw' && (dr === -1 || dc === -1)) ||
        (tile.dir === 'se' && (dr === 1 || dc === 1)) ||
        (tile.dir === 'sw' && (dr === 1 || dc === -1));
      return { canEnter, newReqs };
    }

    case 'blocked':
      return { canEnter: false, newReqs };
  }
};

export { bodyTiles, getNewTiles, findStartBody, isBodyPassable, canLeaveLedge, evaluateEntry };
