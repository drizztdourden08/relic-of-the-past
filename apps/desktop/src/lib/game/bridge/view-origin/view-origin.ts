/* @layer renderer-lib @kind logic */
import type { ViewOrigin, ViewportLike } from './view-origin.type';

const viewOrigin = (vp: ViewportLike): ViewOrigin => ({
  viewLeft: vp.cameraX - vp.cameraLockShiftX - vp.extraLeftRight,
  viewTop: vp.cameraY - vp.cameraLockShiftY - vp.extraTopBottom,
});

export { viewOrigin };
