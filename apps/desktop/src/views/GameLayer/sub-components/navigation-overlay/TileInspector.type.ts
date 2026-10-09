/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { MouseState } from './navigation-overlay.type';

interface TileInspectorProps {
  width: number;
  height: number;
  result: FloodFillResult;
  overworldScreenIndex: number;
  roomIndex: number;
  isIndoors: boolean;
  onHoverTile?: (row: number, col: number) => void;
  pathPreviewState?: MouseState;
}

type DebugHoverWindow = Window & { __debugHoverTile?: (col: number, row: number) => boolean };

export type { DebugHoverWindow, TileInspectorProps };
