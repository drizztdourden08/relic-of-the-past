/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { OverlayView } from './overlay.type';

const overlayTransform = (view: OverlayView) => {
  const { vp, width, height } = view;
  const { viewLeft, viewTop } = viewOrigin(vp);
  return { scaleX: width / vp.snesWidth, scaleY: height / vp.snesHeight, viewLeft, viewTop };
};

export { overlayTransform };
