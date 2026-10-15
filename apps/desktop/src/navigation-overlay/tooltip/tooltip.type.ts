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

type TooltipTone = 'ground' | 'above' | 'ok' | 'warn' | 'bad';

interface LayerBlockProps {
  name: string;
  nameTone: 'ground' | 'above';
  data: LayerTileData;
  locked?: boolean;
}

interface DualLayerPanelsProps {
  ground: LayerTileData;
  above: LayerTileData;
}

interface ReachStatus {
  label: string;
  tone: TooltipTone;
}

type LayerDisplayMode = 'single' | 'dual' | 'locked';

export type {
  DualLayerPanelsProps,
  ExtraRowsProps,
  LayerBlockProps,
  LayerDisplayMode,
  LayerTileData,
  ReachStatus,
  TileTooltipContentProps,
  TooltipData,
  TooltipLayers,
  TooltipTone,
};
