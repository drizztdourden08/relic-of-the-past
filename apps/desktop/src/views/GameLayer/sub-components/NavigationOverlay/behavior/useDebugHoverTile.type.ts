/* @layer renderer-components @kind types */
import type React from 'react';
import type { FloodFillResult } from '@rotp/game-core';
import type { ViewportInfo } from '../../../../../game';
import type { TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';

interface DebugHoverParams {
  result: FloodFillResult;
  width: number;
  roomIndex: number;
  isIndoors: boolean;
  palaceIndex: number;
  vpRef: React.RefObject<ViewportInfo | null>;
  setTooltip: (tooltip: TooltipData) => void;
}

export type { DebugHoverParams };
