/* @layer shared-game @kind logic */
import type { FloodFillResult } from '../types';
import type { TileReq } from '../tile-attrs';
import type { FloodFillOptions } from './flood-options';
import { GRID_SIZE } from '../types';
import { runBFS } from '../core/bfs-engine';
import { DualLayerStrategy } from '../strategies/dual-layer';
import { prepareScreen, constrainVoidTiles, findStartPosition } from './screen-prep';
import { unsupportedUpperVoid } from './upper-void';
import { findEntrancePositions } from './find-entrance-positions';
import { buildBorders } from './build-borders';
import { boundsOrGrid } from './bounds-or-grid';
import { boundsArea } from './bounds-area';

const runDualLayerFlood = (screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const { indoors, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;
  const { layer0, layer1 } = options.dualLayerGrids!;

  const constrainedLayer0 = constrainVoidTiles(layer0, layer1);
  const constrainedLayer1 = constrainVoidTiles(layer1, layer0);
  const upperVoid = unsupportedUpperVoid(constrainedLayer0, constrainedLayer1);

  const upper = prepareScreen(constrainedLayer0, indoors, dynamicBlockers, false);
  const lower = prepareScreen(constrainedLayer1, indoors, dynamicBlockers, true);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (upperVoid[r][c]) upper.grid.tiles[r][c] = { type: 'blocked' };
    }
  }

  const startLayer = options.startLayer ?? 0;
  const start = findStartPosition(startLayer === 0 ? upper.grid : lower.grid, startPos);
  const inv = inventory ?? new Set<TileReq>();
  const { screenEntrances, entrancePositions } = findEntrancePositions(entrances, screenIndex);
  const bounds = boundsOrGrid(quadrantBounds);

  const strategy = new DualLayerStrategy(
    [upper.grid.tiles, lower.grid.tiles],
    [upper.grid.rawAttr, lower.grid.rawAttr],
    indoors,
    startLayer,
  );
  const bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, bounds, options.extraSeeds);
  const { reachable, transitions, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer } = bfsResult;

  return {
    screenIndex, indoors, startPos: start,
    reachable, transitions, reachableCount,
    totalTiles: boundsArea(bounds),
    entrances: screenEntrances, ledges: bfsResult.ledges ?? [], hookTargets, items: [...inv],
    attrGrid: upper.grid.rawAttr, reqGrid, dynamicBlockerCells: upper.dynamicBlockerCells,
    borders: buildBorders(transitions, reachable, inv), variant,
    tileLayer, reachableByLayer, dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

export { runDualLayerFlood };
