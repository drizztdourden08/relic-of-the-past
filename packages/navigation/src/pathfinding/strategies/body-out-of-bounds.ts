/* @layer shared-game @kind logic */
import type { QuadrantBounds } from './layer-strategy';

const bodyOutOfBounds = (r: number, c: number, bounds: QuadrantBounds): boolean =>
  r < bounds.minRow || r + 1 > bounds.maxRow || c < bounds.minCol || c + 1 > bounds.maxCol;

export { bodyOutOfBounds };
