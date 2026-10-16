/* @layer renderer-components @kind logic */
import { regularPolygonVertices } from './regular-polygon-vertices';

const traceRegularPolygon = (ctx: CanvasRenderingContext2D, sides: number, hw: number, hh: number): void => {
  ctx.beginPath();
  for (const [i, vertex] of regularPolygonVertices(sides, hw, hh).entries()) {
    if (i === 0) ctx.moveTo(vertex.x, vertex.y);
    else ctx.lineTo(vertex.x, vertex.y);
  }
  ctx.closePath();
};

export { traceRegularPolygon };
