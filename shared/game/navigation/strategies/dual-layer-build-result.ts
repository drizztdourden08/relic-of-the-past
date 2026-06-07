/* @layer shared-game @kind logic */
/** Converts dual-layer BFS body-reached state into merged per-tile reachability + per-layer grids. */
import type { TilePassability, GridPos, ReachState } from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types';
import type { QuadrantBounds } from './layer-strategy';
import { bodyTiles } from './bfs-helpers';

/** Swap-layer stair tile attrs (bidirectional layer transitions). */
const SWAP_STAIR_ATTRS = new Set([0x1E, 0x1F, 0x3E, 0x3F]);

interface DualLayerTileResult {
  reachable: ReachState[][];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
  tileLayer: (0 | 1 | 2)[][];
  reachableByLayer: [ReachState[][], ReachState[][]];
}

interface BuildDualLayerArgs {
  bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]];
  bounds: QuadrantBounds;
  grids: [TilePassability[][], TilePassability[][]];
  rawAttrs: [number[][], number[][]];
  tileContext: TileAttrContext;
  traversedStairTiles: { layer: 0 | 1; row: number; col: number; reqs: Set<string> }[];
  traversedLedgeTiles: { row: number; col: number; reqs: Set<string> }[];
}

const buildDualLayerTileResult = (args: BuildDualLayerArgs): DualLayerTileResult => {
  const { bodyReached, bounds, grids, rawAttrs, tileContext, traversedStairTiles, traversedLedgeTiles } = args;
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
          if (SWAP_STAIR_ATTRS.has(rawAttrs[0][tr]?.[tc]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][tr]?.[tc])) continue;
          const existing = reached[layer][tr][tc];
          if (existing === null || existing.size > reqs.size) {
            reached[layer][tr][tc] = reqs;
          }
        }
      }
    }
  }

  // Mark traversed stair tiles on the TARGET layer
  for (const { layer, row, col, reqs } of traversedStairTiles) {
    const existing = reached[layer][row]?.[col];
    if (existing === null || existing.size > reqs.size) {
      reached[layer][row][col] = reqs;
    }
  }

  // Mark traversed ledge tiles on layer 0
  for (const { row, col, reqs } of traversedLedgeTiles) {
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

  return { reachable, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer };
};

export { buildDualLayerTileResult, SWAP_STAIR_ATTRS };
export type { DualLayerTileResult };
