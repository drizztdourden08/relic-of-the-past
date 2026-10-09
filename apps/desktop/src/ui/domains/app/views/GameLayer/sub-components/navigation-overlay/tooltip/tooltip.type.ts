/* @layer renderer-components @kind types */
import type { TileClassification } from '@rotp/navigation';
import type { ReachState } from '@rotp/game-core';

interface LayerTileData {
  classification: TileClassification;
  reach: ReachState;
  canPass: boolean | null;
  isAboveLayer: boolean;
}

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

interface TileTooltipContentProps {
  tooltip: TooltipData;
}

interface ExtraRowsProps {
  tooltip: TooltipData;
}

interface LayerBlockProps {
  name: string;
  nameColor: string;
  data: LayerTileData;
  locked?: boolean;
}

interface DualLayerPanelsProps {
  ground: LayerTileData;
  above: LayerTileData;
}

interface ReachStatus {
  label: string;
  color: string;
}

type LayerDisplayMode = 'single' | 'dual' | 'locked';

interface LayerReach {
  layer0Reach?: boolean;
  layer1Reach?: boolean;
}

export type {
  DualLayerPanelsProps, ExtraRowsProps, LayerBlockProps, LayerDisplayMode, LayerReach, LayerTileData, ReachStatus,
  TileTooltipContentProps, TooltipData, TooltipLayers,
};
