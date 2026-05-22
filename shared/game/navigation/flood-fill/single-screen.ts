import type { TilePassability, TransitionPoint, GridPos } from '../types';
import { GRID_SIZE } from '../types';
import { DIRECTIONS, has2TileClearance } from '../core';
import { isPassableForClearance } from '../core/inventory';

interface FloodCell {
  row: number;
  col: number;
  requirements: Set<string>;
}

interface SingleScreenResult {
  reachable: boolean[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  reqGrid: string[][];
}

/**
 * BFS flood-fill on a single screen's 64x64 collision grid.
 * Uses 0-1 deque: free tiles cost 0, obstacles cost 1.
 * Records all reachable border tiles and entrance positions.
 */
export function floodFillBFS(
  grid: TilePassability[][],
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
): SingleScreenResult {
  const reached: (Set<string> | null)[][] = Array.from(
    { length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null),
  );
  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();

  const deque: FloodCell[] = [];
  const startReqs = new Set<string>();
  deque.push({ row: startRow, col: startCol, requirements: startReqs });
  reached[startRow][startCol] = startReqs;

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, requirements } = cell;

    const existing = reached[row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions
    recordBorderTransition(row, col, requirements, foundBorders, transitions);

    // Record entrance proximity
    for (const ent of entrancePositions) {
      if (Math.abs(row - ent.row) <= 6 && Math.abs(col - ent.col) <= 6) {
        const key = `entrance-${ent.idx}`;
        if (!foundBorders.has(key)) {
          foundBorders.add(key);
          transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
        }
      }
    }

    // Expand neighbors
    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;

      // Ledge exit restriction: can only leave in ledge direction
      const currentTile = grid[row][col];
      if (currentTile.type === 'ledge') {
        if (!canLeaveLedge(currentTile.dir, dr, dc)) continue;
      }

      const tile = grid[nr][nc];
      const { canEnter, newReqs } = evaluateEntry(tile, dr, dc, requirements, inventory);
      if (!canEnter) continue;

      const existingReqs = reached[nr][nc];
      if (existingReqs !== null && existingReqs.size <= newReqs.size) continue;

      reached[nr][nc] = newReqs;
      if (newReqs === requirements) {
        deque.unshift({ row: nr, col: nc, requirements: newReqs });
      } else {
        deque.push({ row: nr, col: nc, requirements: newReqs });
      }
    }
  }

  // Build results
  let reachableCount = 0;
  const reachable: boolean[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const isReachable = reached[r][c] !== null;
      if (isReachable) reachableCount++;
      return isReachable;
    }),
  );

  const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const reqs = reached[r][c];
      return reqs && reqs.size > 0 ? [...reqs].join(',') : '';
    }),
  );

  return { reachable, transitions, reachableCount, reqGrid };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function recordBorderTransition(
  row: number, col: number,
  requirements: Set<string>,
  foundBorders: Set<string>,
  transitions: TransitionPoint[],
): void {
  if (row === 0) {
    const key = `north-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'north', requirements: [...requirements] }); }
  }
  if (row === GRID_SIZE - 1) {
    const key = `south-${col}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'south', requirements: [...requirements] }); }
  }
  if (col === 0) {
    const key = `west-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'west', requirements: [...requirements] }); }
  }
  if (col === GRID_SIZE - 1) {
    const key = `east-${row}`;
    if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'east', requirements: [...requirements] }); }
  }
}

function canLeaveLedge(dir: string, dr: number, dc: number): boolean {
  return (
    (dir === 's' && dr === 1) ||
    (dir === 'n' && dr === -1) ||
    (dir === 'e' && dc === 1) ||
    (dir === 'w' && dc === -1)
  );
}

function evaluateEntry(
  tile: TilePassability,
  dr: number, dc: number,
  requirements: Set<string>,
  inventory: Set<string>,
): { canEnter: boolean; newReqs: Set<string> } {
  let newReqs = requirements;

  switch (tile.type) {
    case 'free':
    case 'pit':
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
}
