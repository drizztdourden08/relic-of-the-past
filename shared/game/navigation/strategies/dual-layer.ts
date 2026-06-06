import type { TilePassability, GridPos, ReachState } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types';
import type { LayerStrategy, BFSCell, BFSExpansionResult, QuadrantBounds } from './layer-strategy';
import { bodyTiles, getNewTiles, canLeaveLedge, evaluateEntry } from './bfs-helpers';

/** Swap-layer stair tile attrs (bidirectional layer transitions). */
const SWAP_STAIR_ATTRS = new Set([0x1E, 0x1F, 0x3E, 0x3F]);

/**
 * Dual-layer BFS strategy for indoor rooms with layer-swap stairs and ledge transitions.
 * Tracks reachability on both layers and handles cross-layer movement via stairs and ledges.
 */
class DualLayerStrategy implements LayerStrategy {
  readonly layerCount = 2 as const;
  private readonly grids: [TilePassability[][], TilePassability[][]];
  private readonly rawAttrs: [number[][], number[][]];
  private readonly tileContext: TileAttrContext;
  private readonly startLayer: 0 | 1;
  private readonly traversedStairTiles: { layer: 0 | 1; row: number; col: number; reqs: Set<string> }[] = [];
  private readonly traversedLedgeTiles: { row: number; col: number; reqs: Set<string> }[] = [];

  constructor(
    grids: [TilePassability[][], TilePassability[][]],
    rawAttrs: [number[][], number[][]],
    tileContext: TileAttrContext,
    startLayer: 0 | 1,
  ) {
    this.grids = grids;
    this.rawAttrs = rawAttrs;
    this.tileContext = tileContext;
    this.startLayer = startLayer;
  }

  getGrid(layer: 0 | 1): TilePassability[][] { return this.grids[layer]; }
  getRawAttr(layer: 0 | 1): number[][] { return this.rawAttrs[layer]; }
  findStartLayer(): 0 | 1 { return this.startLayer; }

  expand(
    cell: BFSCell,
    dr: number,
    dc: number,
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const { row, col, layer, requirements } = cell;
    const nr = row + dr;
    const nc = col + dc;

    if (nr < bounds.minRow || nr + 1 > bounds.maxRow || nc < bounds.minCol || nc + 1 > bounds.maxCol) return [];

    const newTiles = getNewTiles(nr, nc, dr, dc);

    // ─── Ledge detection: new tiles on layer 0 hitting a ledge ───
    let hitLedge = false;
    let ledgeFallMatch = false;
    if (layer === 0) {
      for (const [tr, tc] of newTiles) {
        const t = this.grids[0][tr][tc];
        if (t.type === 'ledge') {
          hitLedge = true;
          if (canLeaveLedge(t.dir, dr, dc)) ledgeFallMatch = true;
          break;
        }
      }
    }

    if (hitLedge && !ledgeFallMatch) return [];

    if (hitLedge && ledgeFallMatch) {
      // Full 2x2 body must be ledge tiles for Link to jump — 1-wide ledges are invalid
      let fullBodyLedge = true;
      for (const [br, bc] of bodyTiles(nr, nc)) {
        const t = this.grids[0][br][bc];
        if (t.type !== 'ledge' || !canLeaveLedge(t.dir, dr, dc)) {
          fullBodyLedge = false;
          break;
        }
      }
      if (!fullBodyLedge) return [];

      const results = this.expandLedgeCross(nr, nc, dr, dc, requirements, inventory, bounds);
      return results;
    }

    // ─── Stair detection ───
    // Check BOTH layers' raw attrs (consistent with onStair check in expandStairCross).
    // If a tile is a swap-stair on either layer, it blocks normal same-layer expansion.
    let hitStair = false;
    for (const [tr, tc] of newTiles) {
      if (SWAP_STAIR_ATTRS.has(this.rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][tr]?.[tc])) {
        hitStair = true; break;
      }
    }

    if (hitStair) {
      if (dc !== 0) return []; // Side entry blocked
      return this.expandStairCross(nr, nc, dr, dc, layer, requirements, inventory, bounds);
    }

    // ─── Same-layer expansion ───
    const targetGrid = this.grids[layer];
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
    if (!canMove) return [];

    return [{ row: nr, col: nc, layer, requirements: newReqs }];
  }

  private expandLedgeCross(
    nr: number, nc: number, dr: number, dc: number,
    requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const targetGrid = this.grids[1];
    const layer0Grid = this.grids[0];

    const ledgeTiles: [number, number][] = [];

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      const lc = nc + step * dc;
      if (lr < bounds.minRow || lr + 1 > bounds.maxRow || lc < bounds.minCol || lc + 1 > bounds.maxCol) break;

      let stillOnCliff = false;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        if (layer0Grid[br][bc].type === 'ledge') {
          stillOnCliff = true;
          ledgeTiles.push([br, bc]);
        }
      }
      if (stillOnCliff) continue;

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
        for (const [lr2, lc2] of ledgeTiles) {
          this.traversedLedgeTiles.push({ row: lr2, col: lc2, reqs: requirements });
        }
        return [];
      }
    }
    return [];
  }

  private expandStairCross(
    nr: number, nc: number, dr: number, _dc: number,
    layer: 0 | 1, requirements: Set<string>, inventory: Set<string>, bounds: QuadrantBounds,
  ): BFSExpansionResult[] {
    const otherLayer = (1 - layer) as 0 | 1;
    const targetGrid = this.grids[otherLayer];
    const stairTiles: [number, number][] = [];

    for (let step = 0; step < GRID_SIZE; step++) {
      const lr = nr + step * dr;
      const lc = nc;
      if (lr < bounds.minRow || lr + 1 > bounds.maxRow || lc < bounds.minCol || lc + 1 > bounds.maxCol) break;

      let onStair = false;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        if (SWAP_STAIR_ATTRS.has(this.rawAttrs[0][br]?.[bc]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][br]?.[bc])) {
          onStair = true;
          stairTiles.push([br, bc]);
        }
      }
      if (onStair) continue;

      let canLand = true;
      let newReqs = requirements;
      for (const [br, bc] of bodyTiles(lr, lc)) {
        const tile = targetGrid[br][bc];
        const entry = evaluateEntry(tile, dr, 0, requirements, inventory);
        if (!entry.canEnter) { canLand = false; break; }
        if (entry.newReqs !== newReqs) {
          newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
          for (const req of entry.newReqs) newReqs.add(req);
        }
      }
      if (canLand) {
        for (const [sr, sc] of stairTiles) {
          this.traversedStairTiles.push({ layer: otherLayer, row: sr, col: sc, reqs: requirements });
        }
        return [{ row: lr, col: lc, layer: otherLayer, requirements: newReqs }];
      }
    }
    return [];
  }

  buildTileResult(
    bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]],
    bounds: QuadrantBounds,
  ): {
    reachable: ReachState[][];
    reachableCount: number;
    reqGrid: string[][];
    hookTargets: GridPos[];
    tileLayer: (0 | 1 | 2)[][];
    reachableByLayer: [ReachState[][], ReachState[][]];
  } {
    const { minRow, maxRow, minCol, maxCol } = bounds;

    // Convert body positions to per-tile reachability (merge both layers)
    const reached: [(Set<string> | null)[][], (Set<string> | null)[][]] = [
      Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
      Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(null)),
    ];

    for (let layer = 0; layer < 2; layer++) {
      for (let r = minRow; r < GRID_SIZE - 1 && r <= maxRow; r++) {
        for (let c = minCol; c < GRID_SIZE - 1 && c <= maxCol; c++) {
          const reqs = bodyReached[layer][r][c];
          if (reqs === null) continue;
          for (const [tr, tc] of bodyTiles(r, c)) {
            if (SWAP_STAIR_ATTRS.has(this.rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(this.rawAttrs[1][tr]?.[tc])) continue;
            const existing = reached[layer][tr][tc];
            if (existing === null || existing.size > reqs.size) {
              reached[layer][tr][tc] = reqs;
            }
          }
        }
      }
    }

    // Mark traversed stair tiles on the TARGET layer
    for (const { layer, row, col, reqs } of this.traversedStairTiles) {
      const existing = reached[layer][row]?.[col];
      if (existing === null || existing.size > reqs.size) {
        reached[layer][row][col] = reqs;
      }
    }

    // Mark traversed ledge tiles on layer 0
    for (const { row, col, reqs } of this.traversedLedgeTiles) {
      const existing = reached[0][row]?.[col];
      if (existing === null || existing.size > reqs.size) {
        reached[0][row][col] = reqs;
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

        const bestLayer = r0 !== null && r1 !== null
          ? (r0.size <= r1.size ? 0 : 1)
          : (r0 !== null ? 0 : 1);
        const grid = this.grids[bestLayer];
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
        if (r0 !== null) reachableByLayer[0][r][c] = state;
        if (r1 !== null) reachableByLayer[1][r][c] = state;

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
    const hookSet = getHookshotTargetTiles(this.tileContext);
    const hookTargets: GridPos[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!reachable[r][c]) continue;
        if (hookSet.has(this.rawAttrs[0][r][c]) || hookSet.has(this.rawAttrs[1][r][c])) {
          hookTargets.push({ row: r, col: c });
        }
      }
    }

    return { reachable, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer };
  }
}

export { DualLayerStrategy };
