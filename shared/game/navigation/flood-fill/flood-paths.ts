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
import { unsupportedUpperVoid } from './upper-void';
import { findEntrancePositions, buildBorders } from './orchestrator-helpers';
import type { FloodFillOptions } from './flood-options';

const runDualLayerFlood = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const { indoors, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;
  const { layer0, layer1 } = options.dualLayerGrids!;

  // Mark boundary-connected void as blocked on each layer.
  // In dungeon rooms, 0x00 on a layer means either "real ground" or "structural void"
  // (empty space belonging to the other layer). Void regions always touch the grid edge.
  // Real ground is enclosed by walls on that layer.
  const constrainedLayer0 = constrainVoidTiles(layer0, layer1);
  const constrainedLayer1 = constrainVoidTiles(layer1, layer0);
  // Layer 0 is the UPPER floor, so it gets a second test the lower floor must
  // not: an enclosed 0x00 region up there is only real if something supports it
  // (see upper-void.ts). The same test on layer 1 would wall off every ordinary
  // ground floor, which by definition has open space above it.
  const upperVoid = unsupportedUpperVoid(constrainedLayer0, constrainedLayer1);

  // Build separate collision grids for each layer
  const prep0 = prepareScreen(constrainedLayer0, indoors, dynamicBlockers, false);
  const prep1 = prepareScreen(constrainedLayer1, indoors, dynamicBlockers, true); // skip cliffs on layer 1
  // Applied AFTER cliffs so the gap blocks the walk without joining the wall
  // runs the cliff scan follows to find a landing.
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (upperVoid[r][c]) prep0.grid.tiles[r][c] = { type: 'blocked' };
    }
  }

  const grid = prep0.grid;
  const dynamicBlockerCells = prep0.dynamicBlockerCells;

  const startLayer = options.startLayer ?? 0;
  const startGrid = startLayer === 0 ? prep0.grid : prep1.grid;
  const start = findStartPosition(startGrid, startPos);

  const inv = inventory ?? new Set<TileReq>();

  // Determine entrance positions before BFS (needed by both paths)
  const { screenEntrances: sEnts, entrancePositions: ePos } = findEntrancePositions(
    indoors, entrances, screenIndex,
  );

  const bfsBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
  const strategy = new DualLayerStrategy(
    [prep0.grid.tiles, prep1.grid.tiles],
    [prep0.grid.rawAttr, prep1.grid.rawAttr],
    indoors,
    startLayer,
  );

  const bfsResult = runBFS(strategy, start.row, start.col, ePos, inv, bfsBounds, options.extraSeeds);

  const { reachable, transitions, reachableCount, reqGrid, hookTargets, tileLayer, reachableByLayer } = bfsResult;

  // The drawn ledges are the BFS's own real cross-layer landings (dual-layer.ts's
  // expandLedgeCross), not cliff-preprocessing.ts's single-layer wall-run guess —
  // that guess only walks layer 0's own CLIFF_WALL tiles and has no idea layer 1
  // exists, so it can land an arrow on more layer-0 ground instead of the real
  // drop. Every recorded crossing is by construction both reachable (the BFS only
  // attempts one from an already-reached cell) and landable, so no extra filter
  // is needed here the way the old wall-run list required one.
  const reachableLedges = bfsResult.ledges ?? [];
  const borders = buildBorders(transitions, reachable, grid, inv, quadrantBounds);

  return {
    screenIndex, indoors, startPos: start,
    reachable, transitions, reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: sEnts, ledges: reachableLedges, hookTargets, items: [...inv],
    attrGrid: grid.rawAttr, reqGrid, dynamicBlockerCells, borders, variant,
    tileLayer, reachableByLayer, dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

const runSingleLayerFlood = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions, layerBlocked: boolean): FloodFillResult => {
  const { indoors, inventory, startPos, dynamicBlockers, entrances = [], variant, quadrantBounds } = options;

  // When layer changes are blocked (staircaseType 2) but dual grids exist,
  // use the starting layer's grid instead of the raw attr grid.
  const singleLayerGrid = layerBlocked && options.dualLayerGrids
    ? (options.startLayer === 1 ? options.dualLayerGrids.layer1 : options.dualLayerGrids.layer0)
    : rawAttrGrid;
  const prep = prepareScreen(singleLayerGrid, indoors, dynamicBlockers);
  const grid = prep.grid;
  const ledges = prep.ledges;
  const dynamicBlockerCells = prep.dynamicBlockerCells;

  // Determine entrance positions (from the starting layer's grid)
  const { screenEntrances, entrancePositions } = findEntrancePositions(
    indoors, entrances, screenIndex,
  );

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();

  // Single-layer BFS (using unified engine with SingleLayerStrategy)
  const singleBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
  const strategy = new SingleLayerStrategy(grid.tiles, grid.rawAttr, indoors);
  let seeds = options.extraSeeds ? [...options.extraSeeds] : [];
  let bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, singleBounds, seeds.length > 0 ? seeds : undefined);
  // One-way ledge hops: a reachable ledge start drops Link at its landing tile.
  // The BFS walks one tile at a time and can't jump the cliff band, so seed
  // each newly reachable landing and re-run — repeated for chained plateaus.
  for (let pass = 0; pass < 4; pass++) {
    const landings = ledges.filter((l) =>
      bfsResult.reachable[l.startRow]?.[l.startCol]
      && !bfsResult.reachable[l.endRow]?.[l.endCol]
      && grid.tiles[l.endRow]?.[l.endCol]?.type === 'free');
    if (landings.length === 0) break;
    seeds = [...seeds, ...landings.map((l) => ({ row: l.endRow, col: l.endCol }))];
    bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, singleBounds, seeds);
  }

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter((l: { startRow: number; startCol: number }) => bfsResult.reachable[l.startRow]?.[l.startCol]);
  const borders = buildBorders(bfsResult.transitions, bfsResult.reachable, grid, inv, quadrantBounds);

  return {
    screenIndex, indoors, startPos: start,
    reachable: bfsResult.reachable,
    transitions: bfsResult.transitions,
    reachableCount: bfsResult.reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances, ledges: reachableLedges, items: [...inv],
    hookTargets: bfsResult.hookTargets,
    attrGrid: grid.rawAttr, reqGrid: bfsResult.reqGrid,
    dynamicBlockerCells, borders, variant,
    dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

export { runDualLayerFlood, runSingleLayerFlood };
