/* @layer renderer-components @kind logic */
import type { ArrowSegment } from './draw-double-arrow.type';
import type { DrawContext } from './draw.type';
import { STAIR_ARROW_COLOR } from './draw.constants';
import { fillArrowHead } from './fill-arrow-head';

const drawDoubleArrow = (dc: DrawContext, segment: ArrowSegment): void => {
  const { x1, y1, x2, y2 } = segment;
  const { ctx, scaleX, scaleY, TILE_PX } = dc;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  const headLen = Math.min(TILE_PX * Math.min(scaleX, scaleY) * 0.5, lineLen * 0.25);
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
  fillArrowHead(ctx, { x: x2, y: y2, angle, headLen });
  fillArrowHead(ctx, { x: x1, y: y1, angle: angle + Math.PI, headLen });
};

export { drawDoubleArrow };
