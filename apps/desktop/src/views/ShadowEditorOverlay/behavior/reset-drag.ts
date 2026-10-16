/* @layer renderer-components @kind logic */
import type { HandlerDeps } from './overlay.type';

const resetDrag = (d: HandlerDeps): void => {
  d.activeGizmoRef.current = null;
  d.gizmoStartRef.current = null;
  d.setIsDragging(false);
  d.setDragStartWorld(null);
};

export { resetDrag };
