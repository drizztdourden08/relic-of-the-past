/* @layer renderer-components @kind types */
import type { GridLatticeProps } from '../GridLattice.type';

type LatticeOccupantsProps = Pick<GridLatticeProps, 'occupants' | 'activeChildId'>;

export type { LatticeOccupantsProps };
