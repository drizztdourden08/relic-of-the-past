/* @layer renderer-components @kind logic */
import { ARROW_HEAD_SPREAD } from './draw.constants';
import type { ArrowHead } from './fill-arrow-head.type';

const fillArrowHead = (ctx: CanvasRenderingContext2D, head: ArrowHead): void => {
  const { x, y, angle, headLen } = head;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - headLen * Math.cos(angle - ARROW_HEAD_SPREAD), y - headLen * Math.sin(angle - ARROW_HEAD_SPREAD));
  ctx.lineTo(x - headLen * Math.cos(angle + ARROW_HEAD_SPREAD), y - headLen * Math.sin(angle + ARROW_HEAD_SPREAD));
  ctx.closePath();
  ctx.fill();
};

export { fillArrowHead };
