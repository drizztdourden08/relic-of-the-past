/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { createShapeFromDrag } from './create-shape-from-drag';
import { isShapeDragTool } from './is-shape-drag-tool';
import { pointerContext } from './pointer-context';
import { resetDrag } from './reset-drag';
import type { HandlerDeps, PointerContext } from './overlay.type';

const finishShapeDrag = (d: HandlerDeps, c: PointerContext): void => {
  if (!isShapeDragTool(d.activeTool) || !d.isDragging || !d.dragStartWorld) return;
  createShapeFromDrag({
    activeTool: d.activeTool, screenId: c.screenId, worldPos: c.world, dragStart: d.dragStartWorld,
    polygonSides: d.polygonSides, polygonCornerRadius: d.polygonCornerRadius, defaultSmoothing: d.defaultSmoothing,
    defaultLightIntensity: d.defaultLightIntensity, defaultLightRadius: d.defaultLightRadius,
    getEffectiveHeight: d.getEffectiveHeight, addHeightmapElement: d.addHeightmapElement, addLight: d.addLight,
  });
};

const createMouseUp = (d: HandlerDeps) => (e: MouseEvent): void => {
  if (!d.isDragging && d.activeTool !== 'freehand') return;
  const c = pointerContext(d, e);
  if (!c) {
    d.setIsDragging(false);
    return;
  }
  if (d.activeTool === 'select' && d.isDragging && d.selectedElementId && d.dragStartWorld) {
    resetDrag(d);
    return;
  }
  finishShapeDrag(d, c);
  d.setIsDragging(false);
  d.setDragStartWorld(null);
};

export { createMouseUp };
