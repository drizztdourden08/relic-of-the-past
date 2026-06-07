/* @layer shared-game @kind logic */
/** Dual-layer and single-layer flood-fill run paths (collision build → BFS → result). */
import type { FloodFillResult } from '../types';
import type { TileReq } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import { runBFS } from '../core/bfs-engine';
import { SingleLayerStrategy } from '../strategies/single-layer';
import { DualLayerStrategy } from '../strategies/dual-layer';
import type { QuadrantBounds } from '../strategies/layer-strategy';
import { prepareScreen, constrainVoidTiles, findStartPosition } from './screen-prep';
import { findEntrancePositions, buildBorders } from './orchestrator-helpers';
import type { FloodFillOptions } from './flood-options';

const runDualLayerFlood = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const { tileContext, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;
  const { layer0, layer1 } = options.dualLayerGrids!;

  // Mark boundary-connected void as blocked on each layer.
  // In dungeon rooms, 0x00 on a layer means either "real ground" or "structural void"
  // (empty space belonging to the other layer). Void regions always touch the grid edge.
  // Real ground is enclosed by walls on that layer.
  const constrainedLayer0 = constrainVoidTiles(layer0, layer1);
  const constrainedLayer1 = constrainVoidTiles(layer1, layer0);

  // Build separate collision grids for each layer
  const prep0 = prepareScreen(constrainedLayer0, tileContext, dynamicBlockers, false);
  const prep1 = prepareScreen(constrainedLayer1, tileContext, dynamicBlockers, true); // skip cliffs on layer 1

  const grid = prep0.grid;
  const ledges = prep0.ledges;
  const dynamicBlockerCells = prep0.dynamicBlockerCells;

  const startLayer = options.startLayer ?? 0;
  const startGrid = startLayer === 0 ? prep0.grid : prep1.grid;
  const start = findStartPosition(startGrid, startPos);

  const inv = inventory ?? new Set<TileReq>();

  // Determine entrance positions before BFS (needed by both paths)
  const { screenEntrances: sEnts, entrancePositions: ePos } = findEntrancePositions(
    tileContext, entrances, screenIndex,
  );

  const bfsBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
  const strategy = new DualLayerStrategy(
    [prep0.grid.tiles, prep1.grid.tiles],
    [prep0.grid.rawAttr, prep1.grid.rawAttr],
    tileContext,
    startLayer,
  );

  const bfsResult = runBFS(strategy, start.row, start.col, ePos, inv, bfsBounds, options.extraSeeds);

  const { reachable, transitions, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer } = bfsResult;

  // Filter ledges: show arrow only if the approach tile is reachable on layer 0.
  // Ledges only function on the upper layer; layer 1 reachability is irrelevant.
  const layer0Reach = bfsResult.reachableByLayer![0];
  const reachableLedges = ledges.filter(l => {
    const dr = Math.sign(l.endRow - l.startRow);
    const dc = Math.sign(l.endCol - l.startCol);
    const approachRow = l.startRow - dr;
    const approachCol = l.startCol - dc;
    return layer0Reach[approachRow]?.[approachCol] != null && layer0Reach[approachRow][approachCol] !== 0;
  });
  const borders = buildBorders(transitions, reachable, grid, inv, quadrantBounds);

  return {
    screenIndex, tileContext, startPos: start,
    reachable, transitions, reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: sEnts, ledges: reachableLedges, hookTargets,
    attrGrid: grid.rawAttr, reqGrid, dynamicBlockerCells, borders, variant,
    tileLayer, reachableByLayer, dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

const runSingleLayerFlood = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions, layerBlocked: boolean): FloodFillResult => {
  const { tileContext, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;

  // When layer changes are blocked (staircaseType 2) but dual grids exist,
  // use the starting layer's grid instead of the raw attr grid.
  const singleLayerGrid = layerBlocked && options.dualLayerGrids
    ? (options.startLayer === 1 ? options.dualLayerGrids.layer1 : options.dualLayerGrids.layer0)
    : rawAttrGrid;
  const prep = prepareScreen(singleLayerGrid, tileContext, dynamicBlockers);
  const grid = prep.grid;
  const ledges = prep.ledges;
  const dynamicBlockerCells = prep.dynamicBlockerCells;

  // Determine entrance positions (from the starting layer's grid)
  const { screenEntrances, entrancePositions } = findEntrancePositions(
    tileContext, entrances, screenIndex,
  );

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();

  // Single-layer BFS (using unified engine with SingleLayerStrategy)
  const singleBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
  const strategy = new SingleLayerStrategy(grid.tiles, grid.rawAttr, tileContext);
  const bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, singleBounds, options.extraSeeds);

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter((l: { startRow: number; startCol: number }) => bfsResult.reachable[l.startRow]?.[l.startCol]);
  const borders = buildBorders(bfsResult.transitions, bfsResult.reachable, grid, inv, quadrantBounds);

  return {
    screenIndex, tileContext, startPos: start,
    reachable: bfsResult.reachable,
    transitions: bfsResult.transitions,
    reachableCount: bfsResult.reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances, ledges: reachableLedges,
    hookTargets: bfsResult.hookTargets,
    attrGrid: grid.rawAttr, reqGrid: bfsResult.reqGrid,
    dynamicBlockerCells, borders, variant,
    dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

export { runDualLayerFlood, runSingleLayerFlood };
