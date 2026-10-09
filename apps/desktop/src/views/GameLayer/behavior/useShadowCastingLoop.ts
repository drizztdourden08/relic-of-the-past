/* @layer renderer-components @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useRef } from 'react';
import { wasmGetViewportInfo } from '../../../game';
import { createShadowRenderer, viewOrigin } from '@rotp/game-core';
import type { ShadowRenderer } from '@rotp/game-core';
import { useShadowEditorStore } from '../../../stores/shadow-editor-store';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';
import { overworldScreenIdOf } from './overworld-screen-id';
import { OVERWORLD_MODULE } from '../GameLayer.constants';
import type { ShadowLoopParams } from './useShadowCastingLoop.type';

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
        shadowProjectRef.current = await appApi().shadowCasting.load();
      } catch {
        shadowProjectRef.current = null;
      }
      const unsubscribeLiveEdits = useShadowEditorStore.subscribe((state) => {
        if (state.dirty || state.open) {
          shadowProjectRef.current = state.project;
        }
      });
      return unsubscribeLiveEdits;
    },
    createRenderer: (fxCanvas) => createShadowRenderer(fxCanvas),
    onFrame: ({ renderer, gameCanvas, fxCanvas, time }) => {
      if (!shadowCastingRef.current || !shadowProjectRef.current) {
        renderer.setEnabled(false);
        renderer.render(gameCanvas, time);
        return;
      }

      if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
        renderer.resize(gameCanvas.width, gameCanvas.height);
      }

      const vp = wasmGetViewportInfo();
      let screenId = -1;
      if (vp && vp.locationModule === OVERWORLD_MODULE) {
        screenId = overworldScreenIdOf(vp);
        const { viewLeft, viewTop } = viewOrigin(vp);
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
