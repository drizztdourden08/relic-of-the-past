/* @layer renderer-components @kind logic */
import { overlayTransform } from './overlay-transform';
import type { OverlayView, Point } from './overlay.type';

const displayToWorld = (view: OverlayView, displayX: number, displayY: number): Point => {
  const { scaleX, scaleY, viewLeft, viewTop } = overlayTransform(view);
  return { x: displayX / scaleX + viewLeft, y: displayY / scaleY + viewTop };
};

export { displayToWorld };
