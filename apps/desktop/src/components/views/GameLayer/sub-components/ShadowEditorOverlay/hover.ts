/* @layer renderer-components @kind logic */
import { hitTestGizmo, buildGizmoContext } from '../shadow-editor/gizmos';
import type { GizmoPart } from '../shadow-editor/gizmos';
import { worldToDisplay } from './coords';
import type { Vp, Point } from './coords';
import type { ScreenData } from './hittest';

interface HoverArgs {
  vp: Vp;
  width: number;
  height: number;
  screenData: ScreenData;
  selectedType: 'heightmap' | 'light' | null;
  selectedElementId: string | null;
  displayPos: Point;
}

/** Detect which gizmo part (if any) the cursor is over + the cursor to show. */
const detectHover = (a: HoverArgs): { part: GizmoPart | null; cursor: string } => {
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
      if ((displayPos.x - dp.x) ** 2 + (displayPos.y - dp.y) ** 2 < 100) {
        return { part: 'move-center', cursor: 'move' };
      }
    }
  }
  return { part: null, cursor: 'default' };
};

export { detectHover };
