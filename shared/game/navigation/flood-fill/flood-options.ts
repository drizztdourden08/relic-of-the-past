/* @layer shared-game @kind types */
import type { GridPos, OverworldEntrance, ScreenVariant } from '../types';
import type { TileAttrContext, TileReq } from '../tile-attrs';
import type { QuadrantBounds } from '../strategies/layer-strategy';

interface FloodFillOptions {
  tileContext: TileAttrContext;
  inventory?: Set<TileReq>;
  startPos?: GridPos;
  dynamicBlockers?: GridPos[];
  entrances?: OverworldEntrance[];
  exitScreenByRoom?: Map<number, number>;
  variant?: ScreenVariant;
  /** Restrict BFS to a sub-region of the 64×64 grid (for multi-screen indoor rooms). */
  quadrantBounds?: QuadrantBounds;
  /** Both layer grids for indoor dual-layer rooms. Layer 0 has cliffs, layer 1 is under-bridge areas. */
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  /** Stair/transition tiles (where raw 0x1C appeared before normalization). Used as BFS seeds for layer1. */
  stairTiles?: Array<{ row: number; col: number }>;
  /** Override start layer (from live game state). Only used when both layers passable at start. */
  startLayer?: 0 | 1;
  /** kind_of_in_room_staircase value. When 2, layer changes are blocked — force single-layer BFS on startLayer. */
  staircaseType?: number;
  /** Additional seed positions for BFS (used when propagating from adjacent screens). */
  extraSeeds?: GridPos[];
}

export type { FloodFillOptions };
