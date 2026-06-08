/* @layer renderer-components @kind hook */
/** Edge-glow shader render loop for GameLayer (overworld extended-viewport mirror glow). */
import { useEffect } from 'react';
import type React from 'react';
import { wasmGetViewportInfo, wasmRenderCleanFrame } from '../../../../../../lib/game';
import { createEdgeGlowRenderer } from '../../../../../../lib/game/edge-glow';
import type { EdgeGlowRenderer } from '../../../../../../lib/game/edge-glow';

interface EdgeGlowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  glowRendererRef: React.MutableRefObject<EdgeGlowRenderer | null>;
  rafIdRef: React.MutableRefObject<number>;
  edgeEffectRef: React.MutableRefObject<boolean>;
  setBufSize: (s: { w: number; h: number }) => void;
}

const useEdgeGlowLoop = (params: EdgeGlowLoopParams): void => {
  const { status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, rafIdRef, edgeEffectRef, setBufSize } = params;

  useEffect(() => {
    if (status !== 'running') return;
    const gameCanvas = canvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!gameCanvas || !fxCanvas) return;

    // Wait a frame for SDL to set canvas dimensions
    const initId = requestAnimationFrame(() => {
      // Match FX canvas buffer to game canvas buffer
      fxCanvas.width = gameCanvas.width;
      fxCanvas.height = gameCanvas.height;

      const renderer = createEdgeGlowRenderer(fxCanvas);
      if (!renderer) return;
      glowRendererRef.current = renderer;

      // Screen transition fade state
      let prevBlackLeft = -1;
      let prevBlackRight = -1;
      let fadeOpacity = 1.0;
      let fadeTarget = 1.0;
      const FADE_SPEED = 4.0; // per second (0→1 in 250ms)
      let lastTime = 0;

      const loop = (time: number) => {
        const dt = lastTime > 0 ? (time - lastTime) / 1000 : 0;
        lastTime = time;
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
          if (prevBlackLeft >= 0 && isOverworld) {
            const leftDelta = Math.abs(vp.blackLeft - prevBlackLeft);
            const rightDelta = Math.abs(vp.blackRight - prevBlackRight);
            if (leftDelta > 10 || rightDelta > 10) {
              fadeTarget = 0;
              fadeOpacity = 0; // instant hide on transition
            }
          }
          if (isOverworld) {
            prevBlackLeft = vp.blackLeft;
            prevBlackRight = vp.blackRight;
          }

          // If just came back and stable, fade in
          if (isOverworld && hasExtended && fadeTarget === 0 && fadeOpacity <= 0) {
            fadeTarget = 1.0;
          }
        } else {
          renderer.setEnabled(false);
        }

        // Animate fade
        if (fadeOpacity < fadeTarget) {
          fadeOpacity = Math.min(fadeOpacity + dt * FADE_SPEED, fadeTarget);
        } else if (fadeOpacity > fadeTarget) {
          fadeOpacity = Math.max(fadeOpacity - dt * FADE_SPEED, fadeTarget);
        }
        renderer.setEffectOpacity(fadeOpacity);

        // Get clean frame (no HUD) for the mirror pass
        const cleanResult = vp?.isGameplay ? wasmRenderCleanFrame() : null;
        renderer.render(gameCanvas, time, cleanResult ?? null);
        rafIdRef.current = requestAnimationFrame(loop);
      };
      rafIdRef.current = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(initId);
      cancelAnimationFrame(rafIdRef.current);
      if (glowRendererRef.current) {
        glowRendererRef.current.dispose();
        glowRendererRef.current = null;
      }
    };
  }, [status, canvasKey]);
};

export { useEdgeGlowLoop };
