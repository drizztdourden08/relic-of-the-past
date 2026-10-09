/* @layer renderer-components @kind types */
import type React from 'react';
import type { ShadowRenderer } from '../../../../../../lib/game/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';

interface ShadowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowRendererRef: React.MutableRefObject<ShadowRenderer | null>;
  shadowProjectRef: React.MutableRefObject<ShadowCastingProject | null>;
  shadowCastingRef: React.MutableRefObject<boolean>;
}

export type { ShadowLoopParams };
