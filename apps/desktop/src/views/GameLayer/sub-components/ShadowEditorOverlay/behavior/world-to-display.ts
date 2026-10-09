/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { Point, Vp } from './overlay.type';

const worldToDisplay = (vp: Vp, width: number, height: number, worldX: number, worldY: number): Point => {
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  return { x: (worldX - viewLeft) * scaleX, y: (worldY - viewTop) * scaleY };
};

export { worldToDisplay };
