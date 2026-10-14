/* @layer renderer-components @kind logic */
import { createContextMenu } from './handle-context-menu';
import { createDoubleClick } from './handle-double-click';
import { createMouseDown } from './handle-mouse-down';
import { createMouseMove } from './handle-mouse-move';
import { createMouseUp } from './handle-mouse-up';
import type { HandlerDeps } from './overlay.type';

const createMouseHandlers = (d: HandlerDeps) => ({
  handleMouseDown: createMouseDown(d),
  handleMouseUp: createMouseUp(d),
  handleMouseMove: createMouseMove(d),
  handleDoubleClick: createDoubleClick(d),
  handleContextMenu: createContextMenu(d),
});

export { createMouseHandlers };
