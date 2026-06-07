/* @layer shared-game @kind logic */
import type { TransitionPoint, GridPos, ReachState, TilePassability } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types';
import { DIRECTIONS } from '../core';
import {
  bodyTiles, findStartBody, recordBorderTransition, canLeaveLedge, getNewTiles, evaluateEntry,
} from './bfs-helpers';
import type { QuadrantBounds } from './bfs-helpers';

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
const floodFillBFS = (grid: TilePassability[][], startRow: number, startCol: number, entrancePositions: { row: number; col: number; idx: number }[], inventory: Set<string>, rawAttr: number[][], tileContext: TileAttrContext, extraSeeds?: { row: number; col: number }[], quadrantBounds?: QuadrantBounds): SingleScreenResult => {
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
      if (tile.type === 'blocked') return 0;
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
};

export { floodFillBFS };
export type { SingleScreenResult };
