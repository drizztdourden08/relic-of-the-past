import type { TilePassability, TransitionPoint, GridPos, ReachState } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types';
import { DIRECTIONS } from '../core';

interface FloodCell {
  row: number;
  col: number;
  requirements: Set<string>;
}

interface SingleScreenResult {
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
}

/**
 * BFS flood-fill on a single screen's 64x64 collision grid.
 * Uses 0-1 deque: free tiles cost 0, obstacles cost 1.
 * Records all reachable border tiles and entrance positions.
 */
export interface QuadrantBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export function floodFillBFS(
  grid: TilePassability[][],
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
  rawAttr: number[][],
  tileContext: TileAttrContext,
  extraSeeds?: { row: number; col: number }[],
  quadrantBounds?: QuadrantBounds,
): SingleScreenResult {
  const minR = quadrantBounds?.minRow ?? 0;
  const maxR = quadrantBounds?.maxRow ?? GRID_SIZE - 1;
  const minC = quadrantBounds?.minCol ?? 0;
  const maxC = quadrantBounds?.maxCol ?? GRID_SIZE - 1;

  // ─── 2×2 Body BFS ───────────────────────────────────────────────────────────
  // BFS state = top-left corner of Link's 2×2 body.
  // Body occupies: (r,c), (r,c+1), (r+1,c), (r+1,c+1).
  // When moving in a direction, only the 2 NEW tiles exposed need checking.
  const bodyReached: (Set<string> | null)[][] = Array.from(
    { length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null),
  );

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();

  const deque: FloodCell[] = [];

  // Find valid starting body position containing (startRow, startCol)
  const startBody = findStartBody(startRow, startCol, grid, inventory, minR, maxR, minC, maxC);
  if (startBody) {
    const startReqs = new Set<string>();
    // Collect requirements from the initial 4 tiles
    for (const [r, c] of bodyTiles(startBody.row, startBody.col)) {
      const t = grid[r][c];
      if (t.type === 'obstacle' && inventory.has(t.req!)) startReqs.add(t.req!);
      if (t.type === 'water' && inventory.has('flippers')) startReqs.add('flippers');
    }
    deque.push({ row: startBody.row, col: startBody.col, requirements: startReqs });
    bodyReached[startBody.row][startBody.col] = startReqs;
  }

  // Add extra seed positions
  if (extraSeeds) {
    for (const seed of extraSeeds) {
      const seedBody = findStartBody(seed.row, seed.col, grid, inventory, minR, maxR, minC, maxC);
      if (seedBody && bodyReached[seedBody.row][seedBody.col] === null) {
        const seedReqs = new Set<string>();
        for (const [r, c] of bodyTiles(seedBody.row, seedBody.col)) {
          const t = grid[r][c];
          if (t.type === 'obstacle' && inventory.has(t.req!)) seedReqs.add(t.req!);
          if (t.type === 'water' && inventory.has('flippers')) seedReqs.add('flippers');
        }
        deque.push({ row: seedBody.row, col: seedBody.col, requirements: seedReqs });
        bodyReached[seedBody.row][seedBody.col] = seedReqs;
      }
    }
  }

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, requirements } = cell;

    const existing = bodyReached[row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions for all 4 body tiles at quadrant edges
    for (const [r, c] of bodyTiles(row, col)) {
      recordBorderTransition(r, c, requirements, foundBorders, transitions, minR, maxR, minC, maxC);
    }

    // Record entrance reachability from body center (2×2 body center is at +1,+1)
    const bodyCenterRow = row + 1;
    const bodyCenterCol = col + 1;
    for (const ent of entrancePositions) {
      const key = `entrance-${ent.idx}`;
      if (foundBorders.has(key)) continue;
      const nearby =
        bodyCenterRow >= ent.row - 3 && bodyCenterRow <= ent.row + 5 &&
        bodyCenterCol >= ent.col - 3 && bodyCenterCol <= ent.col + 5;
      if (nearby) {
        foundBorders.add(key);
        transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
      }
    }

    // Expand in 4 directions
    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;

      // Body bounds check: top-left must allow full 2×2 within quadrant
      if (nr < minR || nr + 1 > maxR || nc < minC || nc + 1 > maxC) continue;

      // Ledge exit restriction: if ANY current body tile is a ledge, can only leave in its direction
      let ledgeBlocked = false;
      for (const [r, c] of bodyTiles(row, col)) {
        const t = grid[r][c];
        if (t.type === 'ledge' && !canLeaveLedge(t.dir, dr, dc)) {
          ledgeBlocked = true;
          break;
        }
      }
      if (ledgeBlocked) continue;

      // Determine the 2 NEW tiles exposed by this movement
      const newTiles = getNewTiles(nr, nc, dr, dc);

      // Check both new tiles are enterable
      let canMove = true;
      let newReqs = requirements;
      for (const [tr, tc] of newTiles) {
        const tile = grid[tr][tc];
        const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
        if (!entry.canEnter) { canMove = false; break; }
        if (entry.newReqs !== newReqs) {
          newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
          for (const req of entry.newReqs) newReqs.add(req);
        }
      }
      if (!canMove) continue;

      const existingReqs = bodyReached[nr][nc];
      if (existingReqs !== null && existingReqs.size <= newReqs.size) continue;

      bodyReached[nr][nc] = newReqs;
      if (newReqs === requirements) {
        deque.unshift({ row: nr, col: nc, requirements: newReqs });
      } else {
        deque.push({ row: nr, col: nc, requirements: newReqs });
      }
    }
  }

  // ─── Convert body positions to per-tile reachability ─────────────────────────
  const reached: (Set<string> | null)[][] = Array.from(
    { length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null),
  );

  for (let r = minR; r < GRID_SIZE - 1 && r <= maxR; r++) {
    for (let c = minC; c < GRID_SIZE - 1 && c <= maxC; c++) {
      const reqs = bodyReached[r][c];
      if (reqs === null) continue;
      // Mark all 4 body tiles as reachable (keep lowest-cost req set)
      for (const [tr, tc] of bodyTiles(r, c)) {
        const existing = reached[tr][tc];
        if (existing === null || existing.size > reqs.size) {
          reached[tr][tc] = reqs;
        }
      }
    }
  }

  // Build results
  let reachableCount = 0;
  const reachable: ReachState[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      if (reached[r][c] === null) return 0;
      const tile = grid[r][c];
      if (tile.type === 'ledge') return TRAVERSAL_DIR_OFFSET[tile.dir];
      if (tile.type === 'stairs') return STAIRS_TRAVERSAL_STATE;
      reachableCount++;
      return 1;
    }),
  );

  const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const reqs = reached[r][c];
      return reqs && reqs.size > 0 ? [...reqs].join(',') : '';
    }),
  );

  // Collect hookshot targets among reachable tiles
  const hookSet = getHookshotTargetTiles(tileContext);
  const hookTargets: GridPos[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (reachable[r][c] && hookSet.has(rawAttr[r][c])) {
        hookTargets.push({ row: r, col: c });
      }
    }
  }

  return { reachable, transitions, reachableCount, reqGrid, hookTargets };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the 4 tiles occupied by a 2×2 body with top-left at (r, c). */
function bodyTiles(r: number, c: number): [number, number][] {
  return [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
}

/** Get the 2 NEW tiles exposed when moving from body (row, col) in direction (dr, dc). */
function getNewTiles(nr: number, nc: number, dr: number, dc: number): [number, number][] {
  if (dr === -1) return [[nr, nc], [nr, nc + 1]];       // north: new top row
  if (dr === 1) return [[nr + 1, nc], [nr + 1, nc + 1]]; // south: new bottom row
  if (dc === -1) return [[nr, nc], [nr + 1, nc]];       // west: new left column
  return [[nr, nc + 1], [nr + 1, nc + 1]];              // east: new right column
}

/** Find a valid 2×2 body position containing or near (row, col). */
function findStartBody(
  row: number, col: number,
  grid: TilePassability[][], inventory: Set<string>,
  minR: number, maxR: number, minC: number, maxC: number,
): { row: number; col: number } | null {
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
}

/** Check if all 4 tiles of a body position are passable. */
function isBodyPassable(r: number, c: number, grid: TilePassability[][], inventory: Set<string>): boolean {
  for (const [tr, tc] of bodyTiles(r, c)) {
    const t = grid[tr][tc];
    if (t.type === 'blocked') return false;
    if (t.type === 'obstacle' && !inventory.has(t.req!)) return false;
    if (t.type === 'water' && !inventory.has('flippers')) return false;
  }
  return true;
}

function recordBorderTransition(
  row: number, col: number,
  requirements: Set<string>,
  foundBorders: Set<string>,
  transitions: TransitionPoint[],
  minR: number, maxR: number, minC: number, maxC: number,
): void {
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
}

function canLeaveLedge(dir: string, dr: number, dc: number): boolean {
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
}
