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

interface DualLayerFloodCell {
  row: number;
  col: number;
  layer: 0 | 1;
  requirements: Set<string>;
}

interface SingleScreenResult {
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
}

interface DualLayerResult extends SingleScreenResult {
  tileLayer: (0 | 1 | 2)[][];
  /** Per-layer reachable grids: [layer0, layer1]. */
  reachableByLayer: [ReachState[][], ReachState[][]];
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
}

// ─── Dual-Layer BFS ──────────────────────────────────────────────────────────

/** Swap-layer stair tile attrs (bidirectional layer transitions). */
const SWAP_STAIR_ATTRS = new Set([0x1E, 0x1F, 0x3E, 0x3F]);

/**
 * Dual-layer BFS flood-fill for indoor rooms with layer-swap stairs.
 * Tracks which layer each body position is on.  When the body occupies a
 * 0x1E/0x1F stair tile, expansion also tries the OTHER layer's grid.
 */
export function floodFillBFSDualLayer(
  grids: [TilePassability[][], TilePassability[][]],
  rawAttrs: [number[][], number[][]],
  startRow: number,
  startCol: number,
  startLayer: 0 | 1,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
  tileContext: TileAttrContext,
  quadrantBounds?: QuadrantBounds,
): DualLayerResult {
  const minR = quadrantBounds?.minRow ?? 0;
  const maxR = quadrantBounds?.maxRow ?? GRID_SIZE - 1;
  const minC = quadrantBounds?.minCol ?? 0;
  const maxC = quadrantBounds?.maxCol ?? GRID_SIZE - 1;

  // Body reached state: [layer][row][col]
  const bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]] = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
  ];

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();
  // Stair tiles that were successfully traversed — marked after body→tile conversion
  const traversedStairTiles: { layer: 0 | 1; row: number; col: number; reqs: Set<string> }[] = [];

  const deque: DualLayerFloodCell[] = [];

  // Find valid starting body position on the starting layer
  const startBody = findStartBody(startRow, startCol, grids[startLayer], inventory, minR, maxR, minC, maxC);
  if (startBody) {
    const startReqs = new Set<string>();
    for (const [r, c] of bodyTiles(startBody.row, startBody.col)) {
      const t = grids[startLayer][r][c];
      if (t.type === 'obstacle' && inventory.has(t.req!)) startReqs.add(t.req!);
      if (t.type === 'water' && inventory.has('flippers')) startReqs.add('flippers');
    }
    deque.push({ row: startBody.row, col: startBody.col, layer: startLayer, requirements: startReqs });
    bodyReached[startLayer][startBody.row][startBody.col] = startReqs;
  }

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, layer, requirements } = cell;
    const grid = grids[layer];
    const rawAttr = rawAttrs[layer];

    const existing = bodyReached[layer][row][col]!;
    if (existing.size < requirements.size) continue;

    // Record border transitions
    for (const [r, c] of bodyTiles(row, col)) {
      recordBorderTransition(r, c, requirements, foundBorders, transitions, minR, maxR, minC, maxC);
    }

    // Record entrance reachability
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

    for (const [dr, dc] of DIRECTIONS) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr < minR || nr + 1 > maxR || nc < minC || nc + 1 > maxC) continue;

      const newTiles = getNewTiles(nr, nc, dr, dc);

      // ─── Ledge detection: new tiles on layer 0 hitting a ledge ───
      // Ledge tiles are NEVER reachable on layer 0. They block entry and
      // trigger an immediate layer transition to layer 1 in the fall direction.
      let hitLedge = false;
      let ledgeFallMatch = false;
      if (layer === 0) {
        for (const [tr, tc] of newTiles) {
          const t = grids[0][tr][tc];
          if (t.type === 'ledge') {
            hitLedge = true;
            if (canLeaveLedge(t.dir, dr, dc)) {
              ledgeFallMatch = true;
            }
            break;
          }
        }
      }

      // Ledge from non-fall direction → blocked
      if (hitLedge && !ledgeFallMatch) continue;

      // Ledge in fall direction → cross-layer transition to layer 1.
      // Scan forward past the cliff face until the body no longer overlaps any
      // ledge tile on layer 0, and all body tiles are passable on layer 1.
      if (hitLedge && ledgeFallMatch) {
        const targetGrid = grids[1];
        const layer0Grid = grids[0];
        for (let step = 0; step < GRID_SIZE; step++) {
          const lr = nr + step * dr;
          const lc = nc + step * dc;
          if (lr < minR || lr + 1 > maxR || lc < minC || lc + 1 > maxC) break;
          // Body must be fully past the cliff on layer 0
          let stillOnCliff = false;
          for (const [br, bc] of bodyTiles(lr, lc)) {
            if (layer0Grid[br][bc].type === 'ledge') { stillOnCliff = true; break; }
          }
          if (stillOnCliff) continue;
          // Check passability on layer 1
          let canLand = true;
          let newReqs = requirements;
          for (const [br, bc] of bodyTiles(lr, lc)) {
            const tile = targetGrid[br][bc];
            const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
            if (!entry.canEnter) { canLand = false; break; }
            if (entry.newReqs !== newReqs) {
              newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
              for (const req of entry.newReqs) newReqs.add(req);
            }
          }
          if (canLand) {
            const existingReqs = bodyReached[1][lr][lc];
            if (existingReqs === null || existingReqs.size > newReqs.size) {
              bodyReached[1][lr][lc] = newReqs;
              if (newReqs === requirements) {
                deque.unshift({ row: lr, col: lc, layer: 1, requirements: newReqs });
              } else {
                deque.push({ row: lr, col: lc, layer: 1, requirements: newReqs });
              }
            }
            break;
          }
        }
        continue;
      }

      // ─── Stair detection: entering stair tiles triggers auto-traverse ───
      // Stair tiles are an auto-traverse corridor. Link enters one end, animates
      // through, exits the other end on the opposite layer. BFS cannot stand on
      // stair tiles — it scans past them and lands at the first free 2×2 on the
      // other layer. Stairs can only be entered vertically (north/south).
      let hitStair = false;
      for (const [tr, tc] of newTiles) {
        const attr = rawAttr[tr]?.[tc];
        if (SWAP_STAIR_ATTRS.has(attr)) { hitStair = true; break; }
      }

      if (hitStair) {
        // Side entry (east/west) is blocked — stair corridor has walls on sides
        if (dc !== 0) continue;

        const otherLayer = (1 - layer) as 0 | 1;
        const targetGrid = grids[otherLayer];
        // Scan forward in movement direction. Skip positions where body overlaps
        // stair tiles (Link can't stand on stairs — they're auto-traverse).
        // Keep scanning through impassable tiles (void corridor between stair
        // and floor). Land at first position that's both off-stairs AND passable.
        const stairTiles: [number, number][] = [];
        for (let step = 0; step < GRID_SIZE; step++) {
          const lr = nr + step * dr;
          const lc = nc + step * dc;
          if (lr < minR || lr + 1 > maxR || lc < minC || lc + 1 > maxC) break;
          // Body must not overlap any stair tile (check both layers' raw attrs)
          let onStair = false;
          for (const [br, bc] of bodyTiles(lr, lc)) {
            if (SWAP_STAIR_ATTRS.has(rawAttrs[0][br]?.[bc]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][br]?.[bc])) {
              onStair = true;
              stairTiles.push([br, bc]);
            }
          }
          if (onStair) continue;
          // Check passability on other layer at this position
          let canLand = true;
          let newReqs = requirements;
          for (const [br, bc] of bodyTiles(lr, lc)) {
            const tile = targetGrid[br][bc];
            const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
            if (!entry.canEnter) { canLand = false; break; }
            if (entry.newReqs !== newReqs) {
              newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
              for (const req of entry.newReqs) newReqs.add(req);
            }
          }
          if (canLand) {
            const existingReqs = bodyReached[otherLayer][lr][lc];
            if (existingReqs === null || existingReqs.size > newReqs.size) {
              bodyReached[otherLayer][lr][lc] = newReqs;
              if (newReqs === requirements) {
                deque.unshift({ row: lr, col: lc, layer: otherLayer, requirements: newReqs });
              } else {
                deque.push({ row: lr, col: lc, layer: otherLayer, requirements: newReqs });
              }
              // Record stair tiles for arrow rendering (marked in reached after BFS)
              for (const [sr, sc] of stairTiles) {
                traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
              }
            }
            break;
          }
          // Not passable here — keep scanning (void corridor between stair and floor)
        }
        continue; // Stair blocks normal same-layer expansion in this direction
      }

      // ─── Same-layer expansion ───
      {
        const targetGrid = grids[layer];
        let canMove = true;
        let newReqs = requirements;
        for (const [tr, tc] of newTiles) {
          const tile = targetGrid[tr][tc];
          const entry = evaluateEntry(tile, dr, dc, requirements, inventory);
          if (!entry.canEnter) { canMove = false; break; }
          if (entry.newReqs !== newReqs) {
            newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
            for (const req of entry.newReqs) newReqs.add(req);
          }
        }
        if (canMove) {
          const existingReqs = bodyReached[layer][nr][nc];
          if (existingReqs === null || existingReqs.size > newReqs.size) {
            bodyReached[layer][nr][nc] = newReqs;
            if (newReqs === requirements) {
              deque.unshift({ row: nr, col: nc, layer, requirements: newReqs });
            } else {
              deque.push({ row: nr, col: nc, layer, requirements: newReqs });
            }
          }
        }
      }
    }
  }

  // ─── Convert body positions to per-tile reachability (merge both layers) ────
  const reached: [(Set<string> | null)[][], (Set<string> | null)[][]] = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
  ];

  for (let layer = 0; layer < 2; layer++) {
    for (let r = minR; r < GRID_SIZE - 1 && r <= maxR; r++) {
      for (let c = minC; c < GRID_SIZE - 1 && c <= maxC; c++) {
        const reqs = bodyReached[layer][r][c];
        if (reqs === null) continue;
        for (const [tr, tc] of bodyTiles(r, c)) {
          // Skip stair tiles — they're only marked via traversedStairTiles on the target layer
          if (SWAP_STAIR_ATTRS.has(rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][tr]?.[tc])) continue;
          const existing = reached[layer][tr][tc];
          if (existing === null || existing.size > reqs.size) {
            reached[layer][tr][tc] = reqs;
          }
        }
      }
    }
  }

  // Mark traversed stair tiles on the TARGET layer only (for arrow rendering).
  // These are actual tile coords, not body positions, so no 2×2 expansion bleed.
  for (const { layer, row, col, reqs } of traversedStairTiles) {
    const existing = reached[layer][row]?.[col];
    if (existing === null || existing.size > reqs.size) {
      reached[layer][row][col] = reqs;
    }
  }

  // Build merged reachable grid + tileLayer info + per-layer grids
  let reachableCount = 0;
  const reachable: ReachState[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0));
  const tileLayer: (0 | 1 | 2)[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0));
  const reachableByLayer: [ReachState[][], ReachState[][]] = [
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0)),
    Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0)),
  ];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const r0 = reached[0][r][c];
      const r1 = reached[1][r][c];
      if (r0 === null && r1 === null) continue;

      // Pick the layer with the best (fewest) requirements
      const bestLayer = r0 !== null && r1 !== null
        ? (r0.size <= r1.size ? 0 : 1)
        : (r0 !== null ? 0 : 1);
      const grid = grids[bestLayer];
      const tile = grid[r][c];

      if (tile.type === 'blocked') continue;

      let state: ReachState;
      if (tile.type === 'ledge') {
        state = TRAVERSAL_DIR_OFFSET[tile.dir];
      } else if (tile.type === 'stairs') {
        state = STAIRS_TRAVERSAL_STATE;
      } else {
        state = 1;
        reachableCount++;
      }

      reachable[r][c] = state;

      // Per-layer reachable grids
      if (r0 !== null) reachableByLayer[0][r][c] = state;
      if (r1 !== null) reachableByLayer[1][r][c] = state;

      // Track which layer(s) reached this tile
      if (r0 !== null && r1 !== null) tileLayer[r][c] = 2;
      else if (r1 !== null) tileLayer[r][c] = 1;
      else tileLayer[r][c] = 0;
    }
  }

  // Req grid (merge both layers, pick fewest requirements)
  const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const r0 = reached[0][r][c];
      const r1 = reached[1][r][c];
      const best = r0 !== null && r1 !== null ? (r0.size <= r1.size ? r0 : r1)
        : (r0 ?? r1);
      return best && best.size > 0 ? [...best].join(',') : '';
    }),
  );

  // Hookshot targets from both layers
  const hookSet = getHookshotTargetTiles(tileContext);
  const hookTargets: GridPos[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!reachable[r][c]) continue;
      if (hookSet.has(rawAttrs[0][r][c]) || hookSet.has(rawAttrs[1][r][c])) {
        hookTargets.push({ row: r, col: c });
      }
    }
  }

  return { reachable, transitions, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer };
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
