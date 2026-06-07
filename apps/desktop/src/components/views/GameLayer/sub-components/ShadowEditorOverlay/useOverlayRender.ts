/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { useShadowEditorStore } from '../../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../../lib/game';
import { drawOverlay } from './render';
import type { Vp, Point } from './coords';
import type { GizmoPart } from '../shadow-editor/gizmos';
import type { ScreenData } from './hittest';

interface Args {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  vpRef: MutableRefObject<Vp | null>;
  mouseDisplayRef: MutableRefObject<Point | null>;
  hoveredGizmoRef: MutableRefObject<GizmoPart | null>;
  activeGizmoRef: MutableRefObject<GizmoPart | null>;
  open: boolean;
  gameRunning: boolean;
  width: number;
  height: number;
  selectedElementId: string | null;
  freehandPoints: Point[];
  isDrawingFreehand: boolean;
  project: unknown;
  getScreenData: (screenId: number) => ScreenData;
}

/** Drives the requestAnimationFrame loop that draws the editor overlay. */
const useOverlayRender = (a: Args): void => {
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
      if (!vp || vp.locationModule !== 9) { rafRef.current = requestAnimationFrame(draw); return; }
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
