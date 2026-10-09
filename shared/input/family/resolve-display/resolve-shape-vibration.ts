/* @layer shared-input @kind logic */
import type { DisplayContext } from './resolve-display.type';

const resolveShapeVibration = (ctx: DisplayContext): ((intensity: number) => number) => {
  return ctx.override?.shapeVibration ?? ctx.family.shapeVibration ?? ctx.generic.shapeVibration ?? ((intensity) => intensity);
};

export { resolveShapeVibration };
