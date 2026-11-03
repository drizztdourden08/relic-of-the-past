/* @layer renderer-components @kind logic */
import { overlayTransform } from './overlay-transform';
import type { OverlayView, Point } from './overlay.type';

const worldToDisplay = (view: OverlayView, worldX: number, worldY: number): Point => {
  const { scaleX, scaleY, viewLeft, viewTop } = overlayTransform(view);
  return { x: (worldX - viewLeft) * scaleX, y: (worldY - viewTop) * scaleY };
};

export { worldToDisplay };
