/* @layer shared-game @kind types */
import type { TilePassability, TransitionPoint, GridPos, ReachState, LedgeTraversal } from '../../types';

interface BFSCell {
  row: number;
  col: number;
  layer: 0 | 1;
  requirements: Set<string>;
}

interface QuadrantBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

interface BFSExpansionResult {
  row: number;
  col: number;
  layer: 0 | 1;
  requirements: Set<string>;
}

interface BFSResult {
  reachable: ReachState[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  reqGrid: string[][];
  hookTargets: GridPos[];
  tileLayer?: (0 | 1 | 2)[][];
  reachableByLayer?: [ReachState[][], ReachState[][]];
  ledges?: LedgeTraversal[];
}

interface LayerStrategy {
  readonly layerCount: 1 | 2;
  getGrid(layer: 0 | 1): TilePassability[][];
  getRawAttr(layer: 0 | 1): number[][];
  expand(
    cell: BFSCell,
    dr: number,
    dc: number,
    inventory: Set<string>,
    bounds: QuadrantBounds,
  ): BFSExpansionResult[];
  findStartLayer(): 0 | 1;
  buildTileResult(
    bodyReached: [(Set<string> | null)[][], (Set<string> | null)[][]],
    bounds: QuadrantBounds,
    tileContext: string,
  ): {
    reachable: ReachState[][];
    reachableCount: number;
    reqGrid: string[][];
    hookTargets: GridPos[];
    tileLayer?: (0 | 1 | 2)[][];
    reachableByLayer?: [ReachState[][], ReachState[][]];
    ledges?: LedgeTraversal[];
  };
}

export type { BFSCell, QuadrantBounds, BFSExpansionResult, BFSResult, LayerStrategy };
