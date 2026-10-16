/* @layer renderer-components @kind logic */
import { applyHeightmapGizmo } from './heightmap-gizmo-drag';
import { applyLightGizmo } from './light-gizmo-drag';
import { DRAG_START_THRESHOLD } from './overlay.constants';
import type { GizmoPart } from './gizmo.type';
import type { DragInfo, ElementType, HandlerDeps } from './overlay.type';

const gizmoDragMove = (d: HandlerDeps, info: DragInfo, part: GizmoPart, selectedType: ElementType | null): void => {
  const { world, dragStart, screenId, elementId } = info;
  const sd = d.getScreenData(screenId);
  const gizmoStart = d.gizmoStartRef.current;
  if (!gizmoStart) return;
  const dx = world.x - dragStart.x;
  const dy = world.y - dragStart.y;
  if (!d.dragMovedRef.current && (Math.abs(dx) > DRAG_START_THRESHOLD || Math.abs(dy) > DRAG_START_THRESHOLD)) d.dragMovedRef.current = true;
  if (!d.dragMovedRef.current) return;
  if (selectedType === 'heightmap') {
    const el = sd.heightmap.find((h) => h.id === elementId);
    if (el) applyHeightmapGizmo({ part, el, screenId, worldPos: world, gizmoStart, dx, dy, update: d.updateHeightmapElement });
  } else if (selectedType === 'light') {
    const light = sd.lights.find((l) => l.id === elementId);
    if (light) applyLightGizmo({ part, light, screenId, gizmoStart, dx, dy, update: d.updateLight });
  }
};

export { gizmoDragMove };
