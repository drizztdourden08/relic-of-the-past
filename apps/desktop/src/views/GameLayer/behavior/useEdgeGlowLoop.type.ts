/* @layer renderer-components @kind types */
import type React from 'react';
import type { EdgeGlowRenderer } from '@rotp/game-core';
import type { BufferSize } from '../GameLayer.type';

interface EdgeGlowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  glowRendererRef: React.RefObject<EdgeGlowRenderer | null>;
  edgeEffectRef: React.RefObject<boolean>;
  setBufSize: (s: BufferSize) => void;
}

interface FadeState {
  prevBlackLeft: number;
  prevBlackRight: number;
  prevBlackBottom: number;
  prevBlackTop: number;
  fadeOpacity: number;
  fadeTarget: number;
  lastTime: number;
}

export type { EdgeGlowLoopParams, FadeState };
