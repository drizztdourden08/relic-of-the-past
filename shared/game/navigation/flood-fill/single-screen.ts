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
export function floodFillBFS(
  grid: TilePassability[][],
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
  rawAttr: number[][],
  tileContext: TileAttrContext,
  extraSeeds?: { row: number; col: number }[],
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

  // Add extra seed positions (for multi-entry big-screen propagation)
  if (extraSeeds) {
    for (const seed of extraSeeds) {
      if (seed.row >= 0 && seed.row < GRID_SIZE && seed.col >= 0 && seed.col < GRID_SIZE) {
        if (reached[seed.row][seed.col] === null) {
          const seedReqs = new Set<string>();
          deque.push({ row: seed.row, col: seed.col, requirements: seedReqs });
          reached[seed.row][seed.col] = seedReqs;
        }
      }
    }
  }

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, requirements } = cell;

    const existing = reached[row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions
    recordBorderTransition(row, col, requirements, foundBorders, transitions);

    // Record entrance reachability when BFS reaches a tile adjacent to (or inside)
    // the 2x2 entrance trigger footprint. Entrance MAP16 tiles are typically walls
    // (doors/caves); the game triggers entrances from the walkable tile in front
    // via a +7px Y offset, so we use a 3-tile proximity ring. The walkable ground
    // in front of doors is consistently ~4 grid rows below the entrance position.
    for (const ent of entrancePositions) {
      const key = `entrance-${ent.idx}`;
      if (foundBorders.has(key)) continue;
      const nearby =
        row >= ent.row - 3 && row <= ent.row + 4 &&
        col >= ent.col - 3 && col <= ent.col + 4;
      if (nearby) {
        foundBorders.add(key);
        transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
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

      // Link is 16×16px (2×2 sub-tiles). Check 2×2 clearance.
      // Skip clearance for ledge/stairs tiles — Link is mid-jump/transition, body clearance doesn't apply.
      // Free/pit side clearance adds no requirement.
      // If side clearance comes only from a liftable obstacle, accumulate that req
      // so tight cliff|free|bush corridors are marked item-gated (pink), not free (blue).
      let clearanceReq: string | null = null;
      if (tile.type !== 'ledge' && tile.type !== 'stairs') {
        const clearance = getClearanceRequirement(nr, nc, dr, dc, grid, inventory, tile, reached);
        if (!clearance.passes) continue;
        clearanceReq = clearance.req;
      }

      let finalReqs = newReqs;
      if (clearanceReq && !finalReqs.has(clearanceReq)) {
        finalReqs = new Set(finalReqs);
        finalReqs.add(clearanceReq);
      }

      const existingReqs = reached[nr][nc];
      if (existingReqs !== null && existingReqs.size <= finalReqs.size) continue;

      reached[nr][nc] = finalReqs;
      if (finalReqs === requirements) {
        deque.unshift({ row: nr, col: nc, requirements: finalReqs });
      } else {
        deque.push({ row: nr, col: nc, requirements: finalReqs });
      }
    }
  }

  // Build results
  let reachableCount = 0;
  const reachable: ReachState[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      if (reached[r][c] === null) return 0;
      const tile = grid[r][c];
      // Ledge tiles are traversal-only — encode direction in state (>=2)
      if (tile.type === 'ledge') {
        return TRAVERSAL_DIR_OFFSET[tile.dir];
      }
      // Stairs are bidirectional traversal
      if (tile.type === 'stairs') {
        return STAIRS_TRAVERSAL_STATE;
      }
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

/**
 * Check 2×2 clearance for Link's 16px body when entering (row, col) from (dr, dc).
 * Free/pit tiles provide clearance at no cost.
 * A liftable obstacle provides clearance only if inventory permits — its req is returned
 * so the path accumulates it (making tiles reachable only via that corridor show as pink).
 * If no perpendicular tile provides clearance, passes=false.
 */
function getClearanceRequirement(
  row: number, col: number,
  dr: number, dc: number,
  grid: TilePassability[][],
  inventory: Set<string>,
  enteringTile: TilePassability,
  reached: (Set<string> | null)[][],
): { passes: boolean; req: string | null } {
  const perps: [number, number][] = dr !== 0
    ? [[row, col - 1], [row, col + 1]]
    : [[row - 1, col], [row + 1, col]];

  // First pass: free clearance (no requirement)
  for (const [r, c] of perps) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
    const t = grid[r][c];
    if (t.type === 'free' || t.type === 'pit' || t.type === 'stairs') return { passes: true, req: null };
  }

  // Second pass: obstacle-based clearance (propagates the obstacle's requirement).
  // When relying on an obstacle as the side-clearance tile, require that obstacle tile
  // to already be reachable. This prevents bootstrapping into enclosed obstacle pockets,
  // while still allowing traversal inside legitimate bush fields.

  for (const [r, c] of perps) {
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
    const t = grid[r][c];
    if (
      t.type === 'obstacle' &&
      inventory.has(t.req as string) &&
      (
        reached[r][c] !== null ||
        (enteringTile.type === 'obstacle' && enteringTile.req === t.req)
      )
    ) {
      return { passes: true, req: t.req as string };
    }
    if (t.type === 'water' && inventory.has('flippers') && reached[r][c] !== null) {
      return { passes: true, req: 'flippers' };
    }
  }

  return { passes: false, req: null };
}

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
