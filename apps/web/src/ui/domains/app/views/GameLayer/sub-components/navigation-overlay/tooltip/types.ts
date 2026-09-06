/* @layer renderer-components @kind data */
import type { TileClassification } from '@shared/game/navigation/tile-classification';
import type { ReachState } from '@shared/game/navigation/types';

/** One layer block's data. `canPass` is meaningful only for an obstacle; `isAboveLayer` selects the "unsupported" wording. */
interface LayerTileData {
  classification: TileClassification;
  reach: ReachState;
  canPass: boolean | null;
  isAboveLayer: boolean;
}

/** Which layout a tile renders as. Dual falls back to single when either side has no real content. */
type TooltipLayers =
  | { mode: 'single'; primary: LayerTileData }
  | { mode: 'locked'; lockedLayer: 0 | 1; primary: LayerTileData }
  | { mode: 'dual'; above: LayerTileData; ground: LayerTileData };

interface TooltipData {
  x: number;
  y: number;
  row: number;
  col: number;
  roomTypeLabel: string;
  layers: TooltipLayers;
  pathReqs: string;
  bfsBlocked: boolean;
  spriteInfo: string[];
}

export type { LayerTileData, TooltipLayers, TooltipData };
