/* @layer shared-game @kind logic */
import type { ReachState, TilePassability } from '@rotp/game-core';
import type { BuildDualLayerArgs, DualLayerTileResult, ReachedPair } from './dual-layer-build-result.type';
import { getHookshotTargetTiles } from '../tile-attrs';
import { GRID_SIZE } from '../types/grid.constants';
import { cellAt, itemAt } from '../../checked-access';
import { swapStairAt } from './swap-stair-at';
import { collectHookTargets, filledGrid, joinReqs, keepFewer, reachStateOf, spreadBodyReach } from './tile-result';

const fewestOf = (r0: Set<string> | null, r1: Set<string> | null): Set<string> | null => {
  if (r0 === null || r1 === null) return r0 ?? r1;
  return r0.size <= r1.size ? r0 : r1;
};

const reachedLayers = (args: BuildDualLayerArgs): ReachedPair => {
  const { bodyReached, bounds, rawAttrs, traversedStairTiles, traversedLedgeTiles } = args;
  const reached: ReachedPair = [filledGrid<Set<string> | null>(null), filledGrid<Set<string> | null>(null)];
  const isSwapStair = (r: number, c: number): boolean => swapStairAt(rawAttrs, r, c);
  spreadBodyReach(reached[0], bodyReached[0], bounds, isSwapStair);
  spreadBodyReach(reached[1], bodyReached[1], bounds, isSwapStair);
  for (const { layer, row, col, reqs } of traversedStairTiles) keepFewer(reached[layer], row, col, reqs);
  for (const { row, col, reqs } of traversedLedgeTiles) keepFewer(reached[0], row, col, reqs);
  return reached;
};

const bestLayerOf = (r0: Set<string> | null, r1: Set<string> | null): 0 | 1 => {
  if (r0 !== null && r1 !== null) return r0.size <= r1.size ? 0 : 1;
  return r0 !== null ? 0 : 1;
};

const tileLayerOf = (r0: Set<string> | null, r1: Set<string> | null): 0 | 1 | 2 => {
  if (r0 !== null && r1 !== null) return 2;
  return r1 !== null ? 1 : 0;
};

const scoreReach = (reached: ReachedPair, grids: [TilePassability[][], TilePassability[][]]): Omit<DualLayerTileResult, 'reqGrid' | 'hookTargets' | 'ledges'> => {
  let reachableCount = 0;
  const reachable: ReachState[][] = filledGrid(0);
  const tileLayer: (0 | 1 | 2)[][] = filledGrid<0 | 1 | 2>(0);
  const reachableByLayer: [ReachState[][], ReachState[][]] = [filledGrid(0), filledGrid(0)];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const r0 = cellAt(reached[0], r, c);
      const r1 = cellAt(reached[1], r, c);
      if (r0 === null && r1 === null) continue;

      const state = reachStateOf(cellAt(grids[bestLayerOf(r0, r1)], r, c));
      if (state === 0) continue;
      if (state === 1) reachableCount++;

      itemAt(reachable, r)[c] = state;
      if (r0 !== null) itemAt(reachableByLayer[0], r)[c] = state;
      if (r1 !== null) itemAt(reachableByLayer[1], r)[c] = state;
      itemAt(tileLayer, r)[c] = tileLayerOf(r0, r1);
    }
  }
  return { reachable, reachableCount, tileLayer, reachableByLayer };
};

const buildDualLayerTileResult = (args: BuildDualLayerArgs): DualLayerTileResult => {
  const { grids, rawAttrs, tileContext, ledgeCrossings } = args;
  const reached = reachedLayers(args);
  const { reachable, reachableCount, tileLayer, reachableByLayer } = scoreReach(reached, grids);

  const reqGrid: string[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => joinReqs(fewestOf(cellAt(reached[0], r, c), cellAt(reached[1], r, c)))),
  );

  const hookTargets = collectHookTargets(reachable, getHookshotTargetTiles(tileContext), rawAttrs);

  return { reachable, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer, ledges: ledgeCrossings };
};

export { buildDualLayerTileResult };
export type { DualLayerTileResult } from './dual-layer-build-result.type';
