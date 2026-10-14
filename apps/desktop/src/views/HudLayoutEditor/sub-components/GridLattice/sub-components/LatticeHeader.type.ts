/* @layer renderer-components @kind types */
import type { GridLatticeProps } from '../GridLattice.type';

type LatticeHeaderProps = Pick<
  GridLatticeProps,
  'columns' | 'colSizes' | 'trackOn' | 'onCornerDown' | 'onTrackDown' | 'onSizeTrack' | 'onAddTrack' | 'extentOf'
>;

export type { LatticeHeaderProps };
