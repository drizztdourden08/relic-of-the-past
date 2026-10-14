/* @layer renderer-components @kind logic */
import type { AnnotationBoxInput } from './draw-annotation-box.type';
import { BLOCKED_STRIKE_COLOR } from './draw.constants';

const drawAnnotationBox = (input: AnnotationBoxInput): void => {
  const { ctx, style, rect, state, scale } = input;
  const { dx, dy, dw, dh } = rect;
  const settled = state === 'open' || state === 'done';

  ctx.globalAlpha = settled ? 0.22 : 0.42;
  ctx.fillStyle = style.color;
  ctx.fillRect(dx, dy, dw, dh);

  ctx.globalAlpha = settled ? 0.5 : 0.95;
  ctx.strokeStyle = style.color;
  ctx.lineWidth = Math.max(1.25, 1.75 * scale);
  ctx.strokeRect(dx, dy, dw, dh);

  ctx.fillStyle = settled ? style.color : '#fff';
  ctx.font = `${Math.max(8, dh * 0.72)}px monospace`;
  ctx.fillText(style.glyph, dx + dw / 2, dy + dh / 2 + dh * 0.04);

  if (state === 'blocked') {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = BLOCKED_STRIKE_COLOR;
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.beginPath();
    ctx.moveTo(dx, dy + dh);
    ctx.lineTo(dx + dw, dy);
    ctx.stroke();
  }
};

export { drawAnnotationBox };
