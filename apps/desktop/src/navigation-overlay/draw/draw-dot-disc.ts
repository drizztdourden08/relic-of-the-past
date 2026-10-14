/* @layer renderer-components @kind logic */
import type { DrawContext } from './draw.type';
import { DOT_COLOR_REACHABLE, DOT_COLOR_REQ } from './draw.constants';

const drawDotDisc = (dc: DrawContext, x: number, y: number, hasReq: boolean): void => {
  const { ctx, dotRadius } = dc;
  ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
  ctx.beginPath();
  ctx.arc(x, y, dotRadius * 0.6, 0, Math.PI * 2);
  ctx.fill();
};

export { drawDotDisc };
