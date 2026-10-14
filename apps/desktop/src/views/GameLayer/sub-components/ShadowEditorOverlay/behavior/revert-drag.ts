/* @layer renderer-components @kind logic */
import { screenIdFromVp } from './screen-id-from-vp';
import type { HandlerDeps, Vp } from './overlay.type';
import type { ShadowEditorState } from './store-state.type';

const revertDrag = (d: HandlerDeps, store: ShadowEditorState, vp: Vp | null): void => {
  const screenId = vp ? screenIdFromVp(vp) : -1;
  const gizmoStart = d.gizmoStartRef.current;
  const elementId = d.selectedElementId;
  if (!gizmoStart || !elementId || screenId < 0) return;
  if (store.selectedType === 'heightmap') {
    const el = store.getScreenData(screenId).heightmap.find((h) => h.id === elementId);
    if (el) {
      d.updateHeightmapElement(screenId, elementId, {
        shape: { ...el.shape, x: gizmoStart.x, y: gizmoStart.y, width: gizmoStart.width, height: gizmoStart.height, rotation: gizmoStart.rotation },
      });
    }
  } else if (store.selectedType === 'light') {
    d.updateLight(screenId, elementId, { x: gizmoStart.x, y: gizmoStart.y });
  }
};

export { revertDrag };
