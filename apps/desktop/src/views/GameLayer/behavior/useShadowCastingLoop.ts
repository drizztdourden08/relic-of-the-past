/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useRef } from 'react';
import { wasmGetViewportInfo } from '../../../game';
import { createShadowRenderer } from '@rotp/game-core';
import type { ShadowRenderer } from '@rotp/game-core';
import { useShadowEditorStore } from '../../../stores/shadow-editor-store';
import { useCanvasOverlayLoop } from './useCanvasOverlayLoop';
import { applyShadowScreen } from './apply-shadow-screen';
import { overworldShadowScreen } from './overworld-shadow-screen';
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
        shadowProjectRef.current = await requireHostApi().shadowCasting.load();
      } catch {
        shadowProjectRef.current = null;
      }
      const unsubscribeLiveEdits = useShadowEditorStore.subscribe((state) => {
        if (state.loaded) shadowProjectRef.current = state.project;
      });
      return unsubscribeLiveEdits;
    },
    createRenderer: (fxCanvas) => createShadowRenderer(fxCanvas),
    onFrame: ({ renderer, gameCanvas, fxCanvas, time }) => {
      const project = shadowProjectRef.current;
      if (!shadowCastingRef.current || !project) {
        renderer.setEnabled(false);
        renderer.render(gameCanvas, time);
        return;
      }

      if (gameCanvas.width !== fxCanvas.width || gameCanvas.height !== fxCanvas.height) {
        renderer.resize(gameCanvas.width, gameCanvas.height);
      }

      const screenId = overworldShadowScreen(renderer, wasmGetViewportInfo());
      if (screenId !== prevScreenIdRef.current || useShadowEditorStore.getState().dirty) {
        prevScreenIdRef.current = screenId;
        applyShadowScreen(renderer, project, screenId);
      }

      renderer.setDebugMode(useShadowEditorStore.getState().debugMode);
      renderer.render(gameCanvas, time);
    },
  });
};

export { useShadowCastingLoop };
