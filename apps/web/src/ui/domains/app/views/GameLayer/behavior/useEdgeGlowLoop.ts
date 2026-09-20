/* @layer renderer-components @kind hook */
/** Edge-glow shader render loop for GameLayer (overworld extended-viewport mirror glow). */
import { useRef } from 'react';
import type React from 'react';
import { wasmGetViewportInfo, wasmRenderCleanFrame, fulfillFrameCapture } from '../../../../../../lib/game';
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

// Coming back takes a quarter of a second. Leaving is quicker, because what the glow still holds
// through a crossing is the edge of the screen being left, and every frame of that is a frame of the
// wrong picture. Fast enough to be gone before the new screen settles, slow enough to read as a fade.
const FADE_IN_SPEED = 4.0; // per second, so a full second quarter
const FADE_OUT_SPEED = 12.0; // per second, so about 80ms

interface FadeState {
  prevBlackLeft: number;
  prevBlackRight: number;
  prevBlackBottom: number;
  prevBlackTop: number;
  fadeOpacity: number;
  fadeTarget: number;
  lastTime: number;
}

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
        // locationModule is the physical location, unaffected by text/menu overlays.
        const hasExtended = vp.extraLeftRight > 0 || vp.extraTopBottom > 0 || (vp.snesHeight === 240);
        const isOverworld = vp.locationModule === 9;
        if (isOverworld && hasExtended && edgeEffectRef.current) {
          renderer.setEnabled(true);
        } else if (!edgeEffectRef.current || !isOverworld) {
          renderer.setEnabled(false);
        }
        // Only update bounds on the overworld; freeze during text/events.
        if (isOverworld) {
          renderer.setBlackBounds(vp.blackLeft, vp.blackRight, vp.blackBottom, vp.blackTop);
          const maxBottom = vp.extraTopBottom > 0 ? vp.extraTopBottom : (vp.snesHeight === 240 ? 16 : 0);
          renderer.setMaxBounds(vp.extraLeftRight, vp.extraLeftRight, maxBottom, vp.extraTopBottom);
        }

        // Detect screen transition: bounds jump by >10px ONLY during overworld movement.
        // The bottom bound counts too. A crossing between two areas of equal width moves
        // neither horizontal bound, so an up or down crossing never tripped this and the
        // glow kept compositing the departing screen's edge straight through it.
        let boundsMoved = false;
        if (s.prevBlackLeft >= 0 && isOverworld) {
          const leftDelta = Math.abs(vp.blackLeft - s.prevBlackLeft);
          const rightDelta = Math.abs(vp.blackRight - s.prevBlackRight);
          const bottomDelta = Math.abs(vp.blackBottom - s.prevBlackBottom);
          const topDelta = Math.abs(vp.blackTop - s.prevBlackTop);
          boundsMoved = leftDelta > 10 || rightDelta > 10 || bottomDelta > 10 || topDelta > 10;
          if (boundsMoved) {
            s.fadeTarget = 0;
          }
        }
        if (isOverworld) {
          s.prevBlackLeft = vp.blackLeft;
          s.prevBlackRight = vp.blackRight;
          s.prevBlackBottom = vp.blackBottom;
          s.prevBlackTop = vp.blackTop;
        }

        // Back and settled: the bounds stopped moving this frame, so the new screen is the one on
        // screen and the glow can come up again. Asking for the fade to have finished instead would
        // hold it out for the frames it is still on its way down.
        if (isOverworld && hasExtended && s.fadeTarget === 0 && !boundsMoved) {
          s.fadeTarget = 1.0;
        }
      } else {
        renderer.setEnabled(false);
      }

      // Animate fade
      if (s.fadeOpacity < s.fadeTarget) {
        s.fadeOpacity = Math.min(s.fadeOpacity + dt * FADE_IN_SPEED, s.fadeTarget);
      } else if (s.fadeOpacity > s.fadeTarget) {
        s.fadeOpacity = Math.max(s.fadeOpacity - dt * FADE_OUT_SPEED, s.fadeTarget);
      }
      renderer.setEffectOpacity(s.fadeOpacity);

      // Get clean frame (no HUD) for the mirror pass
      const cleanResult = vp?.isGameplay ? wasmRenderCleanFrame() : null;
      renderer.render(gameCanvas, time, cleanResult ?? null);

      // Pending save-state screenshot from this visible frame (same turn: no hidden-canvas readback quirks).
      fulfillFrameCapture(fxCanvas);
    },
  });
};

export { useEdgeGlowLoop };
