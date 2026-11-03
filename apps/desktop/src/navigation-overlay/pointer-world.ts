/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { PointerWorld, PointerWorldParams } from './pointer-world.type';

const pointerWorld = ({ event, vp, width, height }: PointerWorldParams): PointerWorld => {
  const rect = event.currentTarget.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  return { mx, my, scaleX, scaleY, viewLeft, viewTop, worldX: mx / scaleX + viewLeft, worldY: my / scaleY + viewTop };
};

export { pointerWorld };
