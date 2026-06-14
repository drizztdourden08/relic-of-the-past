/* @layer renderer-components @kind hook */
/** Edge-glow shader render loop for GameLayer (overworld extended-viewport mirror glow). */
import { useRef } from 'react';
import type React from 'react';
import { wasmGetViewportInfo, wasmRenderCleanFrame } from '../../../../../../lib/game';
import { createEdgeGlowRenderer } from '../../../../../../lib/game/edge-glow';
import type { EdgeGlowRenderer } from '../../../../../../lib/game/edge-glow';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';

interface EdgeGlowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  glowRendererRef: React.MutableRefObject<EdgeGlowRenderer | null>;
  edgeEffectRef: React.MutableRefObject<boolean>;
  setBufSize: (s: { w: number; h: number }) => void;
}

const FADE_SPEED = 4.0; // per second (0→1 in 250ms)

interface FadeState {
  prevBlackLeft: number;
  prevBlackRight: number;
  fadeOpacity: number;
  fadeTarget: number;
  lastTime: number;
}

const initialFade = (): FadeState => ({ prevBlackLeft: -1, prevBlackRight: -1, fadeOpacity: 1.0, fadeTarget: 1.0, lastTime: 0 });

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
      const s = fadeRef.current;
      const dt = s.lastTime > 0 ? (time - s.lastTime) / 1000 : 0;
      s.lastTime = time;
      // Sync buffer size if game canvas changed (e.g. aspect ratio switch)
      if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
        fxCanvas.width = gameCanvas.width;
        fxCanvas.height = gameCanvas.height;
        setBufSize({ w: gameCanvas.width, h: gameCanvas.height });
      }

      // Query WASM for precise viewport info
      const vp = wasmGetViewportInfo();
      if (vp) {
        // Use locationModule (physical location, unaffected by text/menu overlays)
        // so effects persist during telepathy, NPC dialogue, etc.
        const hasExtended = vp.extraLeftRight > 0 || (vp.snesHeight === 240);
        const isOverworld = vp.locationModule === 9;
        if (isOverworld && hasExtended && edgeEffectRef.current) {
          renderer.setEnabled(true);
        } else if (!edgeEffectRef.current || !isOverworld) {
          renderer.setEnabled(false);
        }
        // Only update bounds when on overworld — freeze during text/events
        if (isOverworld) {
          renderer.setBlackBounds(vp.blackLeft, vp.blackRight, vp.blackBottom);
          const maxBottom = vp.snesHeight === 240 ? 16 : 0;
          renderer.setMaxBounds(vp.extraLeftRight, vp.extraLeftRight, maxBottom);
        }

        // Detect screen transition: bounds jump by >10px ONLY during overworld movement
        if (s.prevBlackLeft >= 0 && isOverworld) {
          const leftDelta = Math.abs(vp.blackLeft - s.prevBlackLeft);
          const rightDelta = Math.abs(vp.blackRight - s.prevBlackRight);
          if (leftDelta > 10 || rightDelta > 10) {
            s.fadeTarget = 0;
            s.fadeOpacity = 0; // instant hide on transition
          }
        }
        if (isOverworld) {
          s.prevBlackLeft = vp.blackLeft;
          s.prevBlackRight = vp.blackRight;
        }

        // If just came back and stable, fade in
        if (isOverworld && hasExtended && s.fadeTarget === 0 && s.fadeOpacity <= 0) {
          s.fadeTarget = 1.0;
        }
      } else {
        renderer.setEnabled(false);
      }

      // Animate fade
      if (s.fadeOpacity < s.fadeTarget) {
        s.fadeOpacity = Math.min(s.fadeOpacity + dt * FADE_SPEED, s.fadeTarget);
      } else if (s.fadeOpacity > s.fadeTarget) {
        s.fadeOpacity = Math.max(s.fadeOpacity - dt * FADE_SPEED, s.fadeTarget);
      }
      renderer.setEffectOpacity(s.fadeOpacity);

      // Get clean frame (no HUD) for the mirror pass
      const cleanResult = vp?.isGameplay ? wasmRenderCleanFrame() : null;
      renderer.render(gameCanvas, time, cleanResult ?? null);
    },
  });
};

export { useEdgeGlowLoop };
