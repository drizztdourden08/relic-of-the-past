/* @layer renderer-components @kind logic */
import { screenIdFromVp } from './screen-id-from-vp';
import type { DragInfo, HandlerDeps, Point, Vp } from './overlay.type';

const dragInfoOf = (d: HandlerDeps, vp: Vp | null, world: Point | null): DragInfo | null => {
  if (!d.isDragging || !d.dragStartWorld || !world || !d.selectedElementId || !vp) return null;
  return { vp, world, dragStart: d.dragStartWorld, elementId: d.selectedElementId, screenId: screenIdFromVp(vp) };
};

export { dragInfoOf };
