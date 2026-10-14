/* @layer renderer-components @kind logic */
import { hitTestGizmo } from './hit-test-gizmo';
import { gizmoContextForElement } from './gizmo-context-for-element';
import { worldToDisplay } from './world-to-display';
import { NO_HOVER } from './hover.constants';
import { LIGHT_HANDLE_HIT_RADIUS_SQ } from './overlay.constants';
import type { HoverArgs, HoverResult } from './overlay.type';

const hoverHeightmap = (a: HoverArgs): HoverResult => {
  const { vp, width, height, screenData, selectedElementId, displayPos } = a;
  const el = screenData.heightmap.find((h) => h.id === selectedElementId);
  if (!el) return NO_HOVER;
  const gizmoCtx = gizmoContextForElement({ vp, width, height }, el);
  if (!gizmoCtx) return NO_HOVER;
  const hit = hitTestGizmo(displayPos.x, displayPos.y, gizmoCtx);
  return { part: hit?.part ?? null, cursor: hit ? hit.cursor : 'default' };
};

const hoverLight = (a: HoverArgs): HoverResult => {
  const { vp, width, height, screenData, selectedElementId, displayPos } = a;
  const light = screenData.lights.find((l) => l.id === selectedElementId);
  if (!light) return NO_HOVER;
  const dp = worldToDisplay({ vp, width, height }, light.x, light.y);
  if ((displayPos.x - dp.x) ** 2 + (displayPos.y - dp.y) ** 2 < LIGHT_HANDLE_HIT_RADIUS_SQ) {
    return { part: 'move-center', cursor: 'move' };
  }
  return NO_HOVER;
};

const detectHover = (a: HoverArgs): HoverResult => {
  if (a.selectedType === 'heightmap') return hoverHeightmap(a);
  if (a.selectedType === 'light') return hoverLight(a);
  return NO_HOVER;
};

export { detectHover };
