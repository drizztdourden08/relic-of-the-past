/* @layer renderer-components @kind types */
import type React from 'react';
import type { FloodFillResult } from '@rotp/game-core';
import type { wasmGetViewportInfo } from '../../../../../game';
import type { GridPos } from '@app/navigation-overlay/navigation-overlay.type';

interface RectSelectionParams {
  mouseToTile: (e: React.MouseEvent<HTMLDivElement>) => GridPos | null;
  result: FloodFillResult;
  width: number;
  height: number;
  isIndoors: boolean;
  vpRef: React.RefObject<ReturnType<typeof wasmGetViewportInfo>>;
}

interface RectSelection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  active: boolean;
}

interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
  tileCount: number;
}

interface TileBlockTextParams {
  result: FloodFillResult;
  attrGrid: number[][];
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

export type { RectSelection, RectSelectionParams, SelectionRect, TileBlockTextParams };
