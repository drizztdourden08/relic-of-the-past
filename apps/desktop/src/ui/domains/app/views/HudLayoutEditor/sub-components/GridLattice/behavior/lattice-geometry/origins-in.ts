/* @layer renderer-components @kind logic */
import type { CellBounds, Occupant } from './lattice-geometry.type';

const originsIn = (occupants: readonly Occupant[], bounds: CellBounds): Occupant[] =>
  occupants.filter((o) => o.column >= bounds.c0 && o.column <= bounds.c1
    && o.row >= bounds.r0 && o.row <= bounds.r1);

export { originsIn };
