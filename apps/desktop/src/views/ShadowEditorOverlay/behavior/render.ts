/* @layer renderer-components @kind logic */
import { screenIdFromVp } from './screen-id-from-vp';
import { drawHeightmaps } from './draw-heightmaps';
import { drawLights } from './draw-lights';
import { drawFreehandInProgress } from './draw-freehand-in-progress';
import { drawDragPreview } from './draw-drag-preview';
import { drawSelectedGizmo } from './draw-selected-gizmo';
import type { DrawArgs, Vp } from './overlay.type';

const drawOverlay = (ctx: CanvasRenderingContext2D, vp: Vp, a: DrawArgs): void => {
  const view = { vp, width: a.width, height: a.height };
  const screenData = a.getScreenData(screenIdFromVp(vp));
  drawHeightmaps(ctx, view, screenData, a.selectedElementId);
  drawLights(ctx, view, screenData, a.selectedElementId);
  if (a.isDrawingFreehand) drawFreehandInProgress(ctx, view, a.freehandPoints);
  drawDragPreview(ctx, view, a.mouseDisplay);
  drawSelectedGizmo(ctx, view, screenData, { hovered: a.hoveredGizmo, active: a.activeGizmo });
  ctx.globalAlpha = 1.0;
};

export { drawOverlay };
