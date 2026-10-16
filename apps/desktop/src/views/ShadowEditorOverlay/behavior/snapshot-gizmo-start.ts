/* @layer renderer-components @kind logic */
import type { GizmoStart } from '../ShadowEditorOverlay.type';
import type { ElementType, ScreenData } from './overlay.type';

const snapshotGizmoStart = (sd: ScreenData, type: ElementType, id: string): GizmoStart | null => {
  if (type === 'heightmap') {
    const el = sd.heightmap.find((h) => h.id === id);
    return el ? { x: el.shape.x, y: el.shape.y, width: el.shape.width, height: el.shape.height, rotation: el.shape.rotation ?? 0 } : null;
  }
  const light = sd.lights.find((l) => l.id === id);
  return light ? { x: light.x, y: light.y, width: 0, height: 0, rotation: 0 } : null;
};

export { snapshotGizmoStart };
