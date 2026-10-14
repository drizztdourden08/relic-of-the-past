/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { genId } from './gen-id';
import { hitTest } from './hittest';
import { isShapeDragTool } from './is-shape-drag-tool';
import { pointerContext } from './pointer-context';
import { snapshotGizmoStart } from './snapshot-gizmo-start';
import type { ElementType, HandlerDeps, PointerContext } from './overlay.type';

const grabGizmo = (d: HandlerDeps, c: PointerContext, elementId: string, selectedType: ElementType | null): void => {
  d.activeGizmoRef.current = d.hoveredGizmoRef.current;
  d.dragMovedRef.current = false;
  d.setIsDragging(true);
  d.setDragStartWorld(c.world);
  if (selectedType) d.gizmoStartRef.current = snapshotGizmoStart(d.getScreenData(c.screenId), selectedType, elementId);
};

const selectDown = (d: HandlerDeps, c: PointerContext, selectedType: ElementType | null): void => {
  if (d.selectedElementId && d.hoveredGizmoRef.current) {
    grabGizmo(d, c, d.selectedElementId, selectedType);
    return;
  }
  const hit = hitTest(d.getScreenData(c.screenId), c.world.x, c.world.y);
  if (!hit) {
    d.setSelectedElement(null, null);
    return;
  }
  d.setSelectedElement(hit.id, hit.type);
  d.setIsDragging(true);
  d.setDragStartWorld(c.world);
  d.dragMovedRef.current = false;
  d.gizmoStartRef.current = snapshotGizmoStart(d.getScreenData(c.screenId), hit.type, hit.id);
};

const placePointLight = (d: HandlerDeps, c: PointerContext): void => {
  d.addLight(c.screenId, {
    id: genId('light'), type: 'point', x: c.world.x, y: c.world.y,
    intensity: d.defaultLightIntensity, radius: d.defaultLightRadius, color: 'sample', castShadows: true,
  });
};

const extendFreehand = (d: HandlerDeps, c: PointerContext): void => {
  if (!d.isDrawingFreehand) {
    d.setIsDrawingFreehand(true);
    d.clearFreehandPoints();
  }
  d.addFreehandPoint(c.world);
};

const createMouseDown = (d: HandlerDeps) => (e: MouseEvent): void => {
  if (e.button !== 0) return;
  const c = pointerContext(d, e);
  if (!c) return;
  if (d.activeTool === 'select') {
    selectDown(d, c, useShadowEditorStore.getState().selectedType);
    return;
  }
  if (isShapeDragTool(d.activeTool)) {
    d.setIsDragging(true);
    d.setDragStartWorld(c.world);
    return;
  }
  if (d.activeTool === 'point-light') {
    placePointLight(d, c);
    return;
  }
  extendFreehand(d, c);
};

export { createMouseDown };
