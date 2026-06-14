/* @layer renderer-components @kind hook */
/** Shadow-casting shader render loop for GameLayer (per-overworld-screen heightmap/lights). */
import { useRef } from 'react';
import type React from 'react';
import { wasmGetViewportInfo } from '../../../../../../lib/game';
import { createShadowRenderer } from '../../../../../../lib/game/shadow-casting';
import type { ShadowRenderer } from '../../../../../../lib/game/shadow-casting';
import type { ShadowCastingProject } from '@shared/types/shadow-casting';
import { useShadowEditorStore } from '../../../../../../stores/shadow-editor-store';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';

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
  const prevScreenIdRef = useRef(-1);

  useCanvasOverlayLoop<ShadowRenderer>({
    status,
    canvasKey,
    gameCanvasRef: canvasRef,
    fxCanvasRef: shadowCanvasRef,
    rendererRef: shadowRendererRef,
    setup: async () => {
      prevScreenIdRef.current = -1;
      try {
        shadowProjectRef.current = await window.api.shadowCasting.load();
      } catch {
        shadowProjectRef.current = null;
      }
      // Subscribe to editor store so live edits are reflected; unsubscribe on teardown.
      const unsub = useShadowEditorStore.subscribe((state) => {
        if (state.dirty || state.open) {
          shadowProjectRef.current = state.project;
        }
      });
      return unsub;
    },
    createRenderer: (fxCanvas) => createShadowRenderer(fxCanvas),
    onFrame: ({ renderer, gameCanvas, fxCanvas, time }) => {
      if (!shadowCastingRef.current || !shadowProjectRef.current) {
        renderer.setEnabled(false);
        renderer.render(gameCanvas, time);
        return;
      }

      // Sync buffer size
      if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
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

      if (screenId !== prevScreenIdRef.current || useShadowEditorStore.getState().dirty) {
        prevScreenIdRef.current = screenId;
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
    },
  });
};

export { useShadowCastingLoop };
