/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { wasmGetViewportInfo } from '@app/game';
import { drawOverlay } from './render';
import { OVERWORLD_MODULE } from '../../../GameLayer.constants';
import type { OverlayRenderArgs } from './overlay.type';

const useOverlayRender = (a: OverlayRenderArgs): void => {
  const rafRef = useRef<number>(0);
  const { canvasRef, vpRef, mouseDisplayRef, hoveredGizmoRef, activeGizmoRef } = a;
  const { open, gameRunning, width, height, selectedElementId, freehandPoints, isDrawingFreehand, project, getScreenData } = a;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open || !gameRunning) {
      if (canvas) { const c = canvas.getContext('2d'); c?.clearRect(0, 0, canvas.width, canvas.height); }
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const vp = wasmGetViewportInfo();
      vpRef.current = vp;
      ctx.clearRect(0, 0, width, height);
      if (!vp || vp.locationModule !== OVERWORLD_MODULE) { rafRef.current = requestAnimationFrame(draw); return; }
      if (useShadowEditorStore.getState().previewMode) { rafRef.current = requestAnimationFrame(draw); return; }
      drawOverlay(ctx, vp, {
        width, height, selectedElementId, freehandPoints, isDrawingFreehand,
        hoveredGizmo: hoveredGizmoRef.current, activeGizmo: activeGizmoRef.current,
        mouseDisplay: mouseDisplayRef.current, getScreenData,
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, vpRef, mouseDisplayRef, hoveredGizmoRef, activeGizmoRef, open, gameRunning, width, height, selectedElementId, freehandPoints, isDrawingFreehand, project, getScreenData]);
};

export { useOverlayRender };
