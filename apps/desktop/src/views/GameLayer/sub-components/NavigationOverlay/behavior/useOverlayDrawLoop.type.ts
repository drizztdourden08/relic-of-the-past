/* @layer renderer-components @kind types */
import type React from 'react';
import type { MouseState } from '@app/navigation-overlay/navigation-overlay.type';

interface OverlayDrawLoopParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  gameRunning: boolean;
  mouseStateRef: React.RefObject<MouseState>;
}

export type { OverlayDrawLoopParams };
