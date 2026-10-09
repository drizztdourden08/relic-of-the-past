/* @layer renderer-components @kind logic */
import type { Occupant } from './lattice-geometry.type';

const covers = (occupant: Occupant, column: number, row: number): boolean =>
  column >= occupant.column && column < occupant.column + occupant.colSpan
  && row >= occupant.row && row < occupant.row + occupant.rowSpan;

export { covers };
