/* @layer renderer-hud @kind logic */
import type { ViewportInfo } from '@rotp/game-core';
import type { ScreenPoint } from '../EnhancedPauseView.type';

const viewOrigin = (vp: ViewportInfo): ScreenPoint => ({
  x: vp.cameraX - vp.cameraLockShiftX - vp.extraLeftRight,
  y: vp.cameraY - vp.cameraLockShiftY,
});

const heroScreenPoint = (vp: ViewportInfo): ScreenPoint => {
  const origin = viewOrigin(vp);
  return { x: vp.linkX - origin.x, y: vp.linkY - origin.y };
};

export { heroScreenPoint };
