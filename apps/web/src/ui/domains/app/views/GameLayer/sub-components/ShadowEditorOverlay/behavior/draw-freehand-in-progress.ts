/* @layer renderer-components @kind logic */
import { worldToDisplay } from './world-to-display';
import type { Point, Vp } from './overlay.type';

const drawFreehandInProgress = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, freehandPoints: Point[]): void => {
  if (freehandPoints.length === 0) return;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < freehandPoints.length; i++) {
    const dp = worldToDisplay(vp, width, height, freehandPoints[i].x, freehandPoints[i].y);
    if (i === 0) ctx.moveTo(dp.x, dp.y);
    else ctx.lineTo(dp.x, dp.y);
  }
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of freehandPoints) {
    const dp = worldToDisplay(vp, width, height, p.x, p.y);
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
  }
};

export { drawFreehandInProgress };
