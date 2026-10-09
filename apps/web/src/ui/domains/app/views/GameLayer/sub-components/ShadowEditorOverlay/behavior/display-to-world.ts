/* @layer renderer-components @kind logic */
import { viewOrigin } from '@app/lib/game/bridge/view-origin';
import type { Point, Vp } from './overlay.type';

const displayToWorld = (vp: Vp, width: number, height: number, displayX: number, displayY: number): Point => {
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  return { x: displayX / scaleX + viewLeft, y: displayY / scaleY + viewTop };
};

export { displayToWorld };
