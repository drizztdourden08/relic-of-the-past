/* @layer shared-game @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { TileReq } from '../tile-attrs';
import type { FloodFillOptions } from './flood-options';
import { runBFS } from '../core/bfs-engine';
import { SingleLayerStrategy } from '../strategies/single-layer';
import { prepareScreen, findStartPosition } from './screen-prep';
import { findEntrancePositions } from './find-entrance-positions';
import { buildBorders } from './build-borders';
import { boundsOrGrid } from './bounds-or-grid';
import { boundsArea } from './bounds-area';
import { LEDGE_RESEED_PASSES } from './flood-fill.constants';

const runSingleLayerFlood = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions, layerBlocked: boolean): FloodFillResult => {
  const { indoors, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;

  const singleLayerGrid = layerBlocked && options.dualLayerGrids
    ? (options.startLayer === 1 ? options.dualLayerGrids.layer1 : options.dualLayerGrids.layer0)
    : rawAttrGrid;
  const { grid, ledges, dynamicBlockerCells } = prepareScreen(singleLayerGrid, indoors, dynamicBlockers);
  const { screenEntrances, entrancePositions } = findEntrancePositions(entrances, screenIndex);

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();
  const bounds = boundsOrGrid(quadrantBounds);
  const strategy = new SingleLayerStrategy(grid.tiles, grid.rawAttr, indoors);

  let seeds = options.extraSeeds ? [...options.extraSeeds] : [];
  let bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, bounds, seeds.length > 0 ? seeds : undefined);
  for (let pass = 0; pass < LEDGE_RESEED_PASSES; pass++) {
    const landings = ledges.filter((l) =>
      bfsResult.reachable[l.startRow]?.[l.startCol]
      && !bfsResult.reachable[l.endRow]?.[l.endCol]
      && grid.tiles[l.endRow]?.[l.endCol]?.type === 'free');
    if (landings.length === 0) break;
    seeds = [...seeds, ...landings.map((l) => ({ row: l.endRow, col: l.endCol }))];
    bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, bounds, seeds);
  }

  const reachableLedges = ledges.filter((l) => bfsResult.reachable[l.startRow]?.[l.startCol]);

  return {
    screenIndex, indoors, startPos: start,
    reachable: bfsResult.reachable,
    transitions: bfsResult.transitions,
    reachableCount: bfsResult.reachableCount,
    totalTiles: boundsArea(bounds),
    entrances: screenEntrances, ledges: reachableLedges, items: [...inv],
    hookTargets: bfsResult.hookTargets,
    attrGrid: grid.rawAttr, reqGrid: bfsResult.reqGrid,
    dynamicBlockerCells, borders: buildBorders(bfsResult.transitions, bfsResult.reachable, inv), variant,
    dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

export { runSingleLayerFlood };
