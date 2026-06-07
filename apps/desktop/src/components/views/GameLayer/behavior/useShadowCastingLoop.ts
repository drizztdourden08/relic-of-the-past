/* @layer renderer-components @kind hook */
/** Shadow-casting shader render loop for GameLayer (per-overworld-screen heightmap/lights). */
import { useEffect } from 'react';
import type React from 'react';
import { wasmGetViewportInfo } from '../../../../lib/game';
import { createShadowRenderer } from '../../../../lib/game/shadow-casting';
import type { ShadowRenderer } from '../../../../lib/game/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';

interface ShadowLoopParams {
  status: string;
  canvasKey: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  shadowRendererRef: React.MutableRefObject<ShadowRenderer | null>;
  shadowProjectRef: React.MutableRefObject<ShadowCastingProject | null>;
  shadowCastingRef: React.MutableRefObject<boolean>;
}

const useShadowCastingLoop = (params: ShadowLoopParams): void => {
  const { status, canvasKey, canvasRef, shadowCanvasRef, shadowRendererRef, shadowProjectRef, shadowCastingRef } = params;

  useEffect(() => {
    if (status !== 'running') return;
    const gameCanvas = canvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!gameCanvas || !shadowCanvas) return;

    // Load shadow project data
    let cancelled = false;
    let shadowRafId = 0;

    const init = async () => {
      try {
        const project = await window.api.shadowCasting.load();
        if (cancelled) return;
        shadowProjectRef.current = project;
      } catch {
        shadowProjectRef.current = null;
      }

      if (cancelled) return;

      // Size shadow canvas to match game
      shadowCanvas.width = gameCanvas.width;
      shadowCanvas.height = gameCanvas.height;

      const renderer = createShadowRenderer(shadowCanvas);
      if (!renderer) return;
      shadowRendererRef.current = renderer;

      // Subscribe to editor store so live edits are reflected
      const unsub = useShadowEditorStore.subscribe((state) => {
        if (state.dirty || state.open) {
          shadowProjectRef.current = state.project;
        }
      });

      let prevScreenId = -1;

      const loop = (time: number) => {
        if (!shadowCastingRef.current || !shadowProjectRef.current) {
          renderer.setEnabled(false);
          renderer.render(gameCanvas, time);
          shadowRafId = requestAnimationFrame(loop);
          return;
        }

        // Sync buffer size
        if (gameCanvas.width !== shadowCanvas.width || gameCanvas.height !== shadowCanvas.height) {
          renderer.resize(gameCanvas.width, gameCanvas.height);
        }

        // Detect current overworld screen from camera position
        const vp = wasmGetViewportInfo();
        let screenId = -1;
        if (vp && vp.locationModule === 9) {
          const screenCol = Math.floor((vp.cameraX + 128) / 512) & 7;
          const screenRow = Math.floor((vp.cameraY + 112) / 512) & 7;
          screenId = screenRow * 8 + screenCol;

          // Update viewport origin every frame (same coords as NavigationOverlay)
          const viewLeft = vp.cameraX - vp.extraLeftRight;
          const viewTop = vp.cameraY;
          renderer.setScreenOrigin(viewLeft, viewTop, vp.snesWidth, vp.snesHeight);
        }

        if (screenId !== prevScreenId || useShadowEditorStore.getState().dirty) {
          prevScreenId = screenId;
          const screenData = shadowProjectRef.current.screens[screenId] ?? null;
          renderer.setScreenData(screenData);
          if (screenData && (screenData.heightmap.length > 0 || screenData.lights.length > 0)) {
            renderer.setEnabled(true);
          } else {
            renderer.setEnabled(false);
          }
        }

        renderer.setDebugMode(useShadowEditorStore.getState().debugMode);
        renderer.render(gameCanvas, time);
        shadowRafId = requestAnimationFrame(loop);
      };
      shadowRafId = requestAnimationFrame(loop);

      // Store cleanup for when effect unmounts
      const origCleanup = () => { unsub(); };
      (shadowRendererRef as any)._unsub = origCleanup;
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(shadowRafId);
      if (shadowRendererRef.current) {
        (shadowRendererRef as any)._unsub?.();
        shadowRendererRef.current.dispose();
        shadowRendererRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, canvasKey]);
};

export { useShadowCastingLoop };
