/* @layer renderer-components @kind types */
import type React from 'react';
import type { ShadowRenderer, ShadowCastingProject } from '@rotp/game-core';

interface ShadowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowRendererRef: React.RefObject<ShadowRenderer | null>;
  shadowProjectRef: React.RefObject<ShadowCastingProject | null>;
  shadowCastingRef: React.RefObject<boolean>;
}

export type { ShadowLoopParams };
