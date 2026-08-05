/* @layer renderer-components @kind data */
import type { TileClassification } from '@shared/game/navigation/tile-classification';
import type { ReachState } from '@shared/game/navigation/types';

/**
 * One layer block's data: its full classification, THIS layer's own reach
 * state, and — only meaningful for a native-attr obstacle — whether the
 * player's current loadout satisfies it. `isAboveLayer` selects the
 * "unsupported" wording over "blocked" in reach-status.ts.
 */
interface LayerTileData {
  classification: TileClassification;
  reach: ReachState;
  canPass: boolean | null;
  isAboveLayer: boolean;
}

/**
 * Which of the three canonical layouts a tile renders as. Dual falls back to
 * single when either side has no real content (see tile-inspector-classification.ts) —
 * so by the time this reaches the tooltip, the mode IS the layout.
 */
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
