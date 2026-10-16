/* @layer renderer-components @kind logic */
import type { DragPreviewBox } from './drag-preview-box.type';
import { traceRegularPolygon } from './trace-regular-polygon';

const paintDragPreview = (ctx: CanvasRenderingContext2D, box: DragPreviewBox, sides: number, isLight: boolean): void => {
  const { cx, cy, hw, hh, wWorld, hWorld } = box;
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.translate(cx, cy);
  traceRegularPolygon(ctx, sides, hw, hh);
  ctx.fillStyle = isLight ? 'rgba(255, 238, 136, 0.25)' : 'hsla(230, 70%, 50%, 0.3)';
  ctx.fill();
  ctx.strokeStyle = isLight ? '#ffee88' : '#6688ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(wWorld)} × ${Math.round(hWorld)}`, 0, -hh - 8);
  ctx.restore();
};

export { paintDragPreview };
