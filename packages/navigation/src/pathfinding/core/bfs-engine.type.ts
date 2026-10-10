/* @layer shared-game @kind types */
import type { GridPos, TransitionPoint } from '@rotp/game-core';
import type { BFSCell, LayerStrategy, QuadrantBounds } from '../strategies/layer-strategy';

interface EntrancePosition {
  row: number;
  col: number;
  idx: number;
}

interface BfsRequest {
  start: GridPos;
  entrancePositions: EntrancePosition[];
  inventory: Set<string>;
  bounds: QuadrantBounds;
  extraSeeds?: GridPos[];
}

type ReachGrid = (Set<string> | null)[][];

interface BfsSearch {
  strategy: LayerStrategy;
  request: BfsRequest;
  bodyReached: [ReachGrid, ReachGrid];
  deque: BFSCell[];
  foundBorders: Set<string>;
  transitions: TransitionPoint[];
}

export type { EntrancePosition, BfsRequest, ReachGrid, BfsSearch };
