/* @layer renderer-components @kind types */
import type React from 'react';
import type { FloodFillResult } from '@shared/game/navigation';
import type { wasmGetViewportInfo } from '../../../../../../../../lib/game';
import type { GridPos } from '../navigation-overlay.type';

interface RectSelectionParams {
  mouseToTile: (e: React.MouseEvent<HTMLDivElement>) => GridPos | null;
  result: FloodFillResult;
  width: number;
  height: number;
  isIndoors: boolean;
  vpRef: React.MutableRefObject<ReturnType<typeof wasmGetViewportInfo>>;
}

interface RectSelection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  active: boolean;
}

export type { RectSelection, RectSelectionParams };
