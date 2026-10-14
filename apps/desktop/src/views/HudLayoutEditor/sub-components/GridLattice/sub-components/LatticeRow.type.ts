/* @layer renderer-components @kind types */
import type { GridLatticeProps } from '../GridLattice.type';

type LatticeRowProps = Pick<
  GridLatticeProps,
  | 'columns' | 'rows' | 'rowSizes' | 'occupants' | 'cellState' | 'trackOn' | 'cursor'
  | 'extentOf' | 'onTrackDown' | 'onSizeTrack' | 'onCellDown' | 'onCellEnter'
> & { row: number };

export type { LatticeRowProps };
