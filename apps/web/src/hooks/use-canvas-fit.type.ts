/* @layer renderer-other @kind types */
import type { RefObject } from 'react';

interface FitSize {
  width: number;
  height: number;
}

interface CanvasFitParams {
  containerRef: RefObject<HTMLElement | null>;
  bufW: number;
  bufH: number;
  stretch?: boolean;
  pixelPerfect?: boolean;
}

export type { CanvasFitParams, FitSize };
