/* @layer renderer-components @kind logic */
import type { DragInfo, HandlerDeps } from './overlay.type';
import type { ShadowEditorState } from './store-state.type';

const bodyDragMove = (d: HandlerDeps, info: DragInfo, store: ShadowEditorState): void => {
  const { world, dragStart, screenId, elementId } = info;
  const gizmoStart = d.gizmoStartRef.current;
  if (!gizmoStart) return;
  const dx = world.x - dragStart.x;
  const dy = world.y - dragStart.y;
  if (store.selectedType === 'heightmap') {
    const el = store.getScreenData(screenId).heightmap.find((h) => h.id === elementId);
    if (el) d.updateHeightmapElement(screenId, elementId, { shape: { ...el.shape, x: gizmoStart.x + dx, y: gizmoStart.y + dy } });
  } else if (store.selectedType === 'light') {
    d.updateLight(screenId, elementId, { x: gizmoStart.x + dx, y: gizmoStart.y + dy });
  }
};

export { bodyDragMove };
