/* @layer renderer-components @kind logic */
import type { ArrowSegment } from './draw-double-arrow.type';
import type { DrawContext } from './draw.type';
import { ARROW_HEAD_SPREAD, STAIR_ARROW_COLOR } from './draw.constants';

const drawDoubleArrow = (dc: DrawContext, segment: ArrowSegment): void => {
  const { x1, y1, x2, y2 } = segment;
  const { ctx, scaleX, scaleY, TILE_PX } = dc;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  const headLen = Math.min(TILE_PX * Math.min(scaleX, scaleY) * 0.5, lineLen * 0.25);
  const spread = ARROW_HEAD_SPREAD;
  const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

  ctx.strokeStyle = STAIR_ARROW_COLOR;
  ctx.fillStyle = STAIR_ARROW_COLOR;
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = shaftWidth;
  const dx = Math.cos(angle) * headLen * 0.85;
  const dy = Math.sin(angle) * headLen * 0.85;
  ctx.beginPath();
  ctx.moveTo(x1 + dx, y1 + dy);
  ctx.lineTo(x2 - dx, y2 - dy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
  ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - headLen * Math.cos(angle - spread + Math.PI), y1 - headLen * Math.sin(angle - spread + Math.PI));
  ctx.lineTo(x1 - headLen * Math.cos(angle + spread + Math.PI), y1 - headLen * Math.sin(angle + spread + Math.PI));
  ctx.closePath();
  ctx.fill();
};

export { drawDoubleArrow };
