/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { OverlayView, Point } from './overlay.type';

const displayToWorld = (view: OverlayView, displayX: number, displayY: number): Point => {
  const { vp, width, height } = view;
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  return { x: displayX / scaleX + viewLeft, y: displayY / scaleY + viewTop };
};

export { displayToWorld };
