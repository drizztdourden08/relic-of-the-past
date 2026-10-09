/* @layer shared-game @kind logic */
import type { GridPos, ReachState } from '../types';
import type { BuildDualLayerArgs, DualLayerTileResult, ReachedLayer } from './dual-layer-build-result.type';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE, TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../types';
import { bodyTiles } from './body-tiles';
import { SWAP_STAIR_ATTRS } from './dual-layer.constants';

const emptyGrid = <T>(fill: T): T[][] => Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(fill));

const keepFewer = (reached: ReachedLayer, row: number, col: number, reqs: Set<string>): void => {
  const existing = reached[row]?.[col];
  if (existing === null || existing.size > reqs.size) reached[row][col] = reqs;
};

const fewestOf = (r0: Set<string> | null, r1: Set<string> | null): Set<string> | null =>
  r0 !== null && r1 !== null ? (r0.size <= r1.size ? r0 : r1) : (r0 ?? r1);

const buildDualLayerTileResult = (args: BuildDualLayerArgs): DualLayerTileResult => {
  const { bodyReached, bounds, grids, rawAttrs, tileContext, traversedStairTiles, traversedLedgeTiles, ledgeCrossings } = args;
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const isSwapStair = (r: number, c: number): boolean => SWAP_STAIR_ATTRS.has(rawAttrs[0][r]?.[c]) || SWAP_STAIR_ATTRS.has(rawAttrs[1][r]?.[c]);

  const reached: [ReachedLayer, ReachedLayer] = [emptyGrid<Set<string> | null>(null), emptyGrid<Set<string> | null>(null)];

  for (let layer = 0; layer < 2; layer++) {
    for (let r = minRow; r < GRID_SIZE - 1 && r <= maxRow; r++) {
      for (let c = minCol; c < GRID_SIZE - 1 && c <= maxCol; c++) {
        const reqs = bodyReached[layer][r][c];
        if (reqs === null) continue;
        for (const [tr, tc] of bodyTiles(r, c)) {
          if (!isSwapStair(tr, tc)) keepFewer(reached[layer], tr, tc, reqs);
        }
      }
    }
  }

  for (const { layer, row, col, reqs } of traversedStairTiles) keepFewer(reached[layer], row, col, reqs);
  for (const { row, col, reqs } of traversedLedgeTiles) keepFewer(reached[0], row, col, reqs);

  let reachableCount = 0;
  const reachable: ReachState[][] = emptyGrid(0);
  const tileLayer: (0 | 1 | 2)[][] = emptyGrid<0 | 1 | 2>(0);
  const reachableByLayer: [ReachState[][], ReachState[][]] = [emptyGrid(0), emptyGrid(0)];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const r0 = reached[0][r][c];
      const r1 = reached[1][r][c];
      if (r0 === null && r1 === null) continue;

      const bestLayer = r0 !== null && r1 !== null ? (r0.size <= r1.size ? 0 : 1) : (r0 !== null ? 0 : 1);
      const tile = grids[bestLayer][r][c];
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
      tileLayer[r][c] = r0 !== null && r1 !== null ? 2 : (r1 !== null ? 1 : 0);
    }
  }

  const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      const best = fewestOf(reached[0][r][c], reached[1][r][c]);
      return best && best.size > 0 ? [...best].join(',') : '';
    }),
  );

  const hookSet = getHookshotTargetTiles(tileContext);
  const hookTargets: GridPos[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!reachable[r][c]) continue;
      if (hookSet.has(rawAttrs[0][r][c]) || hookSet.has(rawAttrs[1][r][c])) hookTargets.push({ row: r, col: c });
    }
  }

  return { reachable, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer, ledges: ledgeCrossings };
};

export { buildDualLayerTileResult };
export type { DualLayerTileResult } from './dual-layer-build-result.type';
