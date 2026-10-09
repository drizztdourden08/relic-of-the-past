/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';

const manhattan = (a: GridPos, b: GridPos): number => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

export { manhattan };
