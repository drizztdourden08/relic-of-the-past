/* @layer renderer-components @kind logic */
import { hitTestGizmo } from './hit-test-gizmo';
import { buildGizmoContext } from './build-gizmo-context';
import { worldToDisplay } from './world-to-display';
import { LIGHT_HANDLE_HIT_RADIUS_SQ } from './overlay.constants';
import type { HoverArgs, HoverResult } from './overlay.type';

const detectHover = (a: HoverArgs): HoverResult => {
  const { vp, width, height, screenData, selectedType, selectedElementId, displayPos } = a;
  if (selectedType === 'heightmap') {
    const el = screenData.heightmap.find((h) => h.id === selectedElementId);
    if (el) {
      const scaleX = width / vp.snesWidth, scaleY = height / vp.snesHeight;
      const gizmoCtx = buildGizmoContext(
        el.shape.x, el.shape.y, el.shape.width, el.shape.height, el.shape.rotation ?? 0,
        scaleX, scaleY, (wx: number, wy: number) => worldToDisplay(vp, width, height, wx, wy),
        el.shape.points, el.shape.sides,
      );
      if (gizmoCtx) {
        const hit = hitTestGizmo(displayPos.x, displayPos.y, gizmoCtx);
        return { part: hit?.part ?? null, cursor: hit ? hit.cursor : 'default' };
      }
    }
  } else if (selectedType === 'light') {
    const light = screenData.lights.find((l) => l.id === selectedElementId);
    if (light) {
      const dp = worldToDisplay(vp, width, height, light.x, light.y);
      if ((displayPos.x - dp.x) ** 2 + (displayPos.y - dp.y) ** 2 < LIGHT_HANDLE_HIT_RADIUS_SQ) {
        return { part: 'move-center', cursor: 'move' };
      }
    }
  }
  return { part: null, cursor: 'default' };
};

export { detectHover };
