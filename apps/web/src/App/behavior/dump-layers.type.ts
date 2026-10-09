/* @layer renderer-appshell @kind types */
interface DualLayerGrids {
  layer0: number[][];
  layer1: number[][];
}

type SplitTile = { col: number; row: number; layer0: number; layer1: number };

type HoverTile = { col: number; row: number };

type HoverVerification = { layer0: number; layer1: number; wouldSplit: boolean };

type DebugHoverWindow = Window & { __debugHoverTile?: (col: number, row: number) => boolean };

export type { DebugHoverWindow, DualLayerGrids, HoverTile, HoverVerification, SplitTile };
