/* @layer renderer-components @kind logic */
import type { MouseEvent } from 'react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { bodyDragMove } from './body-drag-move';
import { displayToWorld } from './display-to-world';
import { dragInfoOf } from './drag-info';
import { getCanvasPos } from './canvas-pos';
import { gizmoDragMove } from './gizmo-drag-move';
import { hoverMove } from './hover-move';
import { isShapeDragTool } from './is-shape-drag-tool';
import type { HandlerDeps } from './overlay.type';

const createMouseMove = (d: HandlerDeps) => (e: MouseEvent): void => {
  const canvas = d.canvasRef.current;
  const vp = d.vpRef.current;
  if (!canvas) return;
  const pos = getCanvasPos(e.clientX, e.clientY, canvas);
  d.mouseDisplayRef.current = pos;
  const world = vp ? displayToWorld({ vp, width: d.width, height: d.height }, pos.x, pos.y) : null;
  const store = useShadowEditorStore.getState();

  const info = dragInfoOf(d, vp, world);
  const activeGizmo = d.activeGizmoRef.current;
  if (info && activeGizmo) {
    gizmoDragMove(d, info, activeGizmo, store.selectedType);
    return;
  }
  if (info && d.activeTool === 'select') {
    bodyDragMove(d, info, store);
    return;
  }
  if (isShapeDragTool(d.activeTool) && d.isDragging) return;
  hoverMove(d, vp, pos, store);
};

export { createMouseMove };
