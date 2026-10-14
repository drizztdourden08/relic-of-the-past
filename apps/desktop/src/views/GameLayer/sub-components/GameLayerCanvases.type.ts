/* @layer renderer-components @kind types */
import type React from 'react';

interface GameLayerCanvasesProps {
  canvasKey: number;
  running: boolean;
  shadowDebugMode: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export type { GameLayerCanvasesProps };
