/* @layer renderer-components @kind logic */
import { covers } from './covers';
import type { Occupant } from './lattice-geometry.type';

const occupantsAt = (occupants: readonly Occupant[], column: number, row: number): Occupant[] =>
  occupants.filter((occupant) => covers(occupant, column, row));

export { occupantsAt };
