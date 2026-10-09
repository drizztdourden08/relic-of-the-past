/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import { wasmGetViewportInfo, wasmRenderCleanFrame, fulfillFrameCapture } from '../../../../../../lib/game';
import { createEdgeGlowRenderer } from '@rotp/game-core';
import type { EdgeGlowRenderer } from '@rotp/game-core';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';
import { edgeGlowFade } from './edge-glow-fade';
import { OVERWORLD_MODULE } from '../GameLayer.constants';
import { TALL_SCREEN_BOTTOM_MAX, TALL_SNES_HEIGHT } from './useEdgeGlowLoop.constants';
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
      if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
        fxCanvas.width = gameCanvas.width;
        fxCanvas.height = gameCanvas.height;
        setBufSize({ w: gameCanvas.width, h: gameCanvas.height });
      }

      const vp = wasmGetViewportInfo();
      if (vp) {
        const tallScreen = vp.snesHeight === TALL_SNES_HEIGHT;
        const hasExtended = vp.extraLeftRight > 0 || vp.extraTopBottom > 0 || tallScreen;
        const isOverworld = vp.locationModule === OVERWORLD_MODULE;
        if (isOverworld && hasExtended && edgeEffectRef.current) {
          renderer.setEnabled(true);
        } else if (!edgeEffectRef.current || !isOverworld) {
          renderer.setEnabled(false);
        }
        if (isOverworld) {
          renderer.setBlackBounds(vp.blackLeft, vp.blackRight, vp.blackBottom, vp.blackTop);
          const maxBottom = vp.extraTopBottom > 0 ? vp.extraTopBottom : (tallScreen ? TALL_SCREEN_BOTTOM_MAX : 0);
          renderer.setMaxBounds(vp.extraLeftRight, vp.extraLeftRight, maxBottom, vp.extraTopBottom);
          edgeGlowFade.trackOverworldCrossing(fade, vp, hasExtended);
        }
      } else {
        renderer.setEnabled(false);
      }

      edgeGlowFade.stepFadeOpacity(fade, dt);
      renderer.setEffectOpacity(fade.fadeOpacity);

      const cleanFrameWithoutHud = vp?.isGameplay ? wasmRenderCleanFrame() : null;
      renderer.render(gameCanvas, time, cleanFrameWithoutHud ?? null);

      fulfillFrameCapture(fxCanvas);
    },
  });
};

export { useEdgeGlowLoop };
