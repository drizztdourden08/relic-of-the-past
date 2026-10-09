/* @layer shared-game @kind types */
import type { TilePassability, GridPos, ReachState, LedgeTraversal } from '../types';
import type { QuadrantBounds } from './layer-strategy';

type ReachedLayer = (Set<string> | null)[][];

interface DualLayerTileResult {
  reachable: ReachState[][];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
  tileLayer: (0 | 1 | 2)[][];
  reachableByLayer: [ReachState[][], ReachState[][]];
  ledges: LedgeTraversal[];
}

interface TraversedTile {
  row: number;
  col: number;
  reqs: Set<string>;
}

interface TraversedStairTile extends TraversedTile {
  layer: 0 | 1;
}

interface BuildDualLayerArgs {
  bodyReached: [ReachedLayer, ReachedLayer];
  bounds: QuadrantBounds;
  grids: [TilePassability[][], TilePassability[][]];
  rawAttrs: [number[][], number[][]];
  tileContext: boolean;
  traversedStairTiles: TraversedStairTile[];
  traversedLedgeTiles: TraversedTile[];
  ledgeCrossings: LedgeTraversal[];
}

export type { BuildDualLayerArgs, DualLayerTileResult, ReachedLayer, TraversedStairTile, TraversedTile };
