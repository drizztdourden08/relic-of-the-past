/* @layer renderer-components @kind logic */
import { worldToDisplay } from './world-to-display';
import type { OverlayView, Point } from './overlay.type';

const traceFreehandShape = (ctx: CanvasRenderingContext2D, view: OverlayView, points: Point[], origin: Point): void => {
  ctx.beginPath();
  for (const [i, point] of points.entries()) {
    const pp = worldToDisplay(view, point.x, point.y);
    if (i === 0) ctx.moveTo(pp.x - origin.x, pp.y - origin.y);
    else ctx.lineTo(pp.x - origin.x, pp.y - origin.y);
  }
  ctx.closePath();
};

export { traceFreehandShape };
