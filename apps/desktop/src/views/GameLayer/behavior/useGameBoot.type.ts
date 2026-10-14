/* @layer renderer-components @kind types */
import type React from 'react';

interface GameBootParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hasStartedRef: React.RefObject<boolean>;
  assetData: Uint8Array | null;
  configIni?: string;
  profileId?: string;
  start: (canvas: HTMLCanvasElement, data: Uint8Array, configIni?: string, profileId?: string) => Promise<void>;
  setCanvasKey: React.Dispatch<React.SetStateAction<number>>;
}

export type { GameBootParams };
