/* @layer renderer-components @kind logic */
import type { HeightmapElement } from '@rotp/game-core';
import { buildGizmoContext } from './build-gizmo-context';
import type { GizmoContext } from './gizmo.type';
import type { OverlayView } from './overlay.type';
import { worldToDisplay } from './world-to-display';

const gizmoContextForElement = (view: OverlayView, el: HeightmapElement): GizmoContext | null => {
  const scale = { scaleX: view.width / view.vp.snesWidth, scaleY: view.height / view.vp.snesHeight };
  return buildGizmoContext(el.shape, scale, (wx, wy) => worldToDisplay(view, wx, wy));
};

export { gizmoContextForElement };
