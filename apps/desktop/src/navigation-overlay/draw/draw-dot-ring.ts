/* @layer renderer-components @kind logic */
import type { DrawContext } from './draw.type';

const drawDotRing = (dc: DrawContext, x: number, y: number, ringColor: string): void => {
  const { ctx, scaleX, scaleY, dotRadius } = dc;
  const ringAlpha = ctx.globalAlpha;
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = Math.max(1, Math.min(scaleX, scaleY) * 0.6);
  ctx.beginPath();
  ctx.arc(x, y, dotRadius * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = ringAlpha;
};

export { drawDotRing };
