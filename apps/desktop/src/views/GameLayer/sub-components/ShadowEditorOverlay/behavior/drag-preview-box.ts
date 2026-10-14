/* @layer renderer-components @kind logic */
import { displayToWorld } from './display-to-world';
import type { DragPreviewBox } from './drag-preview-box.type';
import { DRAG_PREVIEW_MIN_HALF_SIZE } from './overlay.constants';
import type { OverlayView, Point } from './overlay.type';
import { worldToDisplay } from './world-to-display';

const dragPreviewBox = (view: OverlayView, dragStart: Point, mouseDisplay: Point): DragPreviewBox | null => {
  const dragWorld = displayToWorld(view, mouseDisplay.x, mouseDisplay.y);
  const startDP = worldToDisplay(view, dragStart.x, dragStart.y);
  const hw = Math.abs(mouseDisplay.x - startDP.x) / 2;
  const hh = Math.abs(mouseDisplay.y - startDP.y) / 2;
  if (hw <= DRAG_PREVIEW_MIN_HALF_SIZE && hh <= DRAG_PREVIEW_MIN_HALF_SIZE) return null;
  return {
    cx: (startDP.x + mouseDisplay.x) / 2,
    cy: (startDP.y + mouseDisplay.y) / 2,
    hw,
    hh,
    wWorld: Math.abs(dragWorld.x - dragStart.x),
    hWorld: Math.abs(dragWorld.y - dragStart.y),
  };
};

export { dragPreviewBox };
