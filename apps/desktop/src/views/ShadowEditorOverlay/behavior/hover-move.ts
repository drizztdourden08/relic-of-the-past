/* @layer renderer-components @kind logic */
import { detectHover } from './hover';
import { screenIdFromVp } from './screen-id-from-vp';
import type { HandlerDeps, Point, Vp } from './overlay.type';
import type { ShadowEditorState } from './store-state.type';

const hoverMove = (d: HandlerDeps, vp: Vp | null, pos: Point, store: ShadowEditorState): void => {
  if (d.activeTool === 'select' && d.selectedElementId && !d.isDragging && vp) {
    const sd = d.getScreenData(screenIdFromVp(vp));
    const { part, cursor } = detectHover({
      vp, width: d.width, height: d.height, screenData: sd,
      selectedType: store.selectedType, selectedElementId: d.selectedElementId, displayPos: pos,
    });
    d.hoveredGizmoRef.current = part;
    d.setCursor(cursor);
  } else if (d.activeTool !== 'select') {
    d.hoveredGizmoRef.current = null;
    d.setCursor('crosshair');
  }
};

export { hoverMove };
