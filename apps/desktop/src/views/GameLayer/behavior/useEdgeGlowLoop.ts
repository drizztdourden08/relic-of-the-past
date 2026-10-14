/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import { wasmGetViewportInfo, wasmRenderCleanFrame, fulfillFrameCapture } from '../../../game';
import { createEdgeGlowRenderer } from '@rotp/game-core';
import type { EdgeGlowRenderer } from '@rotp/game-core';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';
import { applyGlowViewport } from './apply-glow-viewport';
import { edgeGlowFade } from './edge-glow-fade';
import { syncFxCanvasSize } from './sync-fx-canvas-size';
import type { EdgeGlowLoopParams, FadeState } from './useEdgeGlowLoop.type';

const initialFade = (): FadeState => ({ prevBlackLeft: -1, prevBlackRight: -1, prevBlackBottom: -1, prevBlackTop: -1, fadeOpacity: 1.0, fadeTarget: 1.0, lastTime: 0 });

const useEdgeGlowLoop = (params: EdgeGlowLoopParams): void => {
  const { status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, edgeEffectRef, setBufSize } = params;
  const fadeRef = useRef<FadeState>(initialFade());

  useCanvasOverlayLoop<EdgeGlowRenderer>({
    status,
    canvasKey,
    gameCanvasRef: canvasRef,
    fxCanvasRef,
    rendererRef: glowRendererRef,
    setup: () => { fadeRef.current = initialFade(); },
    createRenderer: (fxCanvas) => createEdgeGlowRenderer(fxCanvas),
    onFrame: ({ renderer, gameCanvas, fxCanvas, time }) => {
      const fade = fadeRef.current;
      const dt = fade.lastTime > 0 ? (time - fade.lastTime) / 1000 : 0;
      fade.lastTime = time;
      syncFxCanvasSize(gameCanvas, fxCanvas, setBufSize);

      const vp = wasmGetViewportInfo();
      applyGlowViewport(renderer, vp, edgeEffectRef.current, fade);

      edgeGlowFade.stepFadeOpacity(fade, dt);
      renderer.setEffectOpacity(fade.fadeOpacity);

      const cleanFrameWithoutHud = vp?.isGameplay ? wasmRenderCleanFrame() : null;
      renderer.render(gameCanvas, time, cleanFrameWithoutHud ?? null);

      fulfillFrameCapture(fxCanvas);
    },
  });
};

export { useEdgeGlowLoop };
