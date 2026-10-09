/* @layer renderer-components @kind logic */
import type { LightGizmoArgs } from './overlay.type';

const applyLightGizmo = (a: LightGizmoArgs): void => {
  const { part, light, screenId, gizmoStart, dx, dy, update } = a;
  if (part !== 'move-center' && part !== 'move-x' && part !== 'move-y') return;
  const nx = part === 'move-y' ? light.x : gizmoStart.x + dx;
  const ny = part === 'move-x' ? light.y : gizmoStart.y + dy;
  update(screenId, light.id, { x: nx, y: ny });
};

export { applyLightGizmo };
