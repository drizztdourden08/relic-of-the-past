/* @layer renderer-components @kind logic */
import { GAP, HEAD, PAD, ROW_IDEAL, VIEWPORT } from './lattice-geometry.constants';

const latticeHeight = (rows: number): number =>
  Math.min(VIEWPORT, HEAD + PAD * 2 + GAP * rows + rows * ROW_IDEAL);

export { latticeHeight };
