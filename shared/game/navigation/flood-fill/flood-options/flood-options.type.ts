/* @layer shared-game @kind types */
import type { GridPos, OverworldEntrance, ScreenVariant } from '../../types';
import type { TileReq } from '../../tile-attrs';
import type { QuadrantBounds } from '../../strategies/layer-strategy';

interface FloodFillOptions {
  indoors: boolean;
  inventory?: Set<TileReq>;
  startPos?: GridPos;
  dynamicBlockers?: GridPos[];
  entrances?: OverworldEntrance[];
  exitScreenByRoom?: Map<number, number>;
  variant?: ScreenVariant;
  quadrantBounds?: QuadrantBounds;
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  startLayer?: 0 | 1;
  staircaseType?: number;
  extraSeeds?: GridPos[];
}

export type { FloodFillOptions };
