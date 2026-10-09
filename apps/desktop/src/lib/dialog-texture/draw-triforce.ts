/* @layer renderer-lib @kind logic */
import { triforcePath } from '@rotp/game-data';
import { TRIFORCE_HEIGHT } from './patterns.constants';

let triforceShape: Path2D | null = null;

const shape = (): Path2D => {
  if (!triforceShape) triforceShape = new Path2D(triforcePath(TRIFORCE_HEIGHT));
  return triforceShape;
};

const drawTriforce = (filled: boolean) => (ctx: CanvasRenderingContext2D): void => {
  if (filled) ctx.fill(shape()); else ctx.stroke(shape());
};

export { drawTriforce };
