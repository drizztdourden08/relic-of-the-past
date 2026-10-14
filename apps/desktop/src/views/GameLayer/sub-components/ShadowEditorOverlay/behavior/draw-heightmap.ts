/* @layer renderer-components @kind logic */
import type { HeightmapElement } from '@rotp/game-core';
import { traceFreehandShape } from './trace-freehand-shape';
import { traceRegularPolygon } from './trace-regular-polygon';
import { worldToDisplay } from './world-to-display';
import type { OverlayView } from './overlay.type';

const drawHeightmap = (ctx: CanvasRenderingContext2D, view: OverlayView, el: HeightmapElement, isSelected: boolean): void => {
  const scaleX = view.width / view.vp.snesWidth;
  const scaleY = view.height / view.vp.snesHeight;
  const dp = worldToDisplay(view, el.shape.x, el.shape.y);
  ctx.save();
  ctx.translate(dp.x, dp.y);
  ctx.rotate((el.shape.rotation ?? 0) * Math.PI / 180);
  const hw = (el.shape.width / 2) * scaleX;
  const hh = (el.shape.height / 2) * scaleY;
  const hue = 200 + el.height * 60;
  ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.2 + el.height * 0.3})`;
  ctx.strokeStyle = isSelected ? '#ffcc00' : `hsla(${hue}, 80%, 60%, 0.8)`;
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  if (el.shape.type === 'freehand' && el.shape.points) {
    traceFreehandShape(ctx, view, el.shape.points, dp);
  } else {
    traceRegularPolygon(ctx, el.shape.sides ?? 4, hw, hh);
  }
  ctx.fill();
  ctx.stroke();
  if (isSelected) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`h=${el.height.toFixed(2)}`, 0, -hh - 4);
  }
  ctx.restore();
};

export { drawHeightmap };
