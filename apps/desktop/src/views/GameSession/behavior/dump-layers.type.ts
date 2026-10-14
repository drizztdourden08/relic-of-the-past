/* @layer renderer-appshell @kind types */
import type { wasmGetIndoorDualLayerGrids, wasmGetLinkLayer, wasmGetViewportInfo } from '@app/game';

interface DualLayerGrids {
  layer0: number[][];
  layer1: number[][];
}

type SplitTile = { col: number; row: number; layer0: number; layer1: number };

type HoverTile = { col: number; row: number };

type HoverVerification = { layer0: number; layer1: number; wouldSplit: boolean };

type DebugHoverWindow = Window & { __debugHoverTile?: (col: number, row: number) => boolean };

interface DumpLayersSnapshot {
  slot: number;
  roomIndex: number | null;
  viewport: ReturnType<typeof wasmGetViewportInfo>;
  playerLayer: ReturnType<typeof wasmGetLinkLayer>;
  screenshotPath: string;
  dualLayerGrids: ReturnType<typeof wasmGetIndoorDualLayerGrids>;
  hoverTile: HoverTile | null;
  hoverVerification: HoverVerification | null;
  hoverScreenshot: string | null;
}

export type { DebugHoverWindow, DualLayerGrids, DumpLayersSnapshot, HoverTile, HoverVerification, SplitTile };
