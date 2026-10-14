/* @layer renderer-components @kind types */
import type React from 'react';
import type { FloodFillResult } from '@rotp/game-core';
import type { wasmGetViewportInfo } from '@app/game';

interface MouseEventToTileParams {
  event: React.MouseEvent<HTMLDivElement>;
  vp: ReturnType<typeof wasmGetViewportInfo>;
  result: FloodFillResult;
  width: number;
  height: number;
  isIndoors: boolean;
}

export type { MouseEventToTileParams };
