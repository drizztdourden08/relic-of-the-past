/* @layer renderer-hud @kind logic */
import type { FrameOrigin } from './choreography.type';
import { STAR_ARM, STAR_CORE, STAR_CORE_FROM_RADIUS } from './draw-star.constants';

const drawStar = (ctx: CanvasRenderingContext2D, centre: FrameOrigin, r: number, diagonals = false): void => {
  const { x: cx, y: cy } = centre;
  ctx.fillStyle = STAR_ARM;
  ctx.fillRect(cx - r, cy, r * 2 + 1, 1);
  ctx.fillRect(cx, cy - r, 1, r * 2 + 1);
  if (diagonals) {
    const d = Math.max(1, r >> 2);
    for (let i = 1; i <= d; i++) {
      ctx.fillRect(cx - i, cy - i, 1, 1);
      ctx.fillRect(cx + i, cy - i, 1, 1);
      ctx.fillRect(cx - i, cy + i, 1, 1);
      ctx.fillRect(cx + i, cy + i, 1, 1);
    }
  }
  ctx.fillStyle = STAR_CORE;
  if (r >= STAR_CORE_FROM_RADIUS) ctx.fillRect(cx - 1, cy - 1, 3, 3);
  else ctx.fillRect(cx, cy, 1, 1);
};

export { drawStar };
