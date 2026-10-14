/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { finalizeFreehand } from './finalize-freehand';
import { pointerContext } from './pointer-context';
import type { HandlerDeps } from './overlay.type';

const createDoubleClick = (d: HandlerDeps) => (e: MouseEvent): void => {
  if (d.activeTool !== 'freehand' || !d.isDrawingFreehand || d.freehandPoints.length < 3) return;
  const c = pointerContext(d, e);
  if (!c) return;
  finalizeFreehand({
    screenId: c.screenId, freehandPoints: d.freehandPoints, worldPos: c.world, defaultSmoothing: d.defaultSmoothing,
    getEffectiveHeight: d.getEffectiveHeight, addHeightmapElement: d.addHeightmapElement,
  });
  d.clearFreehandPoints();
  d.setIsDrawingFreehand(false);
};

export { createDoubleClick };
