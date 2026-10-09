/* @layer shared-game @kind logic */
import type { GridPos } from '../types';

const manhattan = (a: GridPos, b: GridPos): number => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

export { manhattan };
