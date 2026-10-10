/* @layer renderer-components @kind logic */
import { boundsOf } from '../../GridLattice';
import type { CellBounds } from '../../GridLattice';
import type { GridSelection } from '../GridEditor.type';

const selectionBounds = (
  selection: GridSelection, columns: number, rows: number,
): CellBounds | null => {
  switch (selection.kind) {
    case 'cells':
      return boundsOf(selection.cells);
    case 'track':
      return selection.axis === 'columns'
        ? { c0: Math.min(...selection.indices) + 1, c1: Math.max(...selection.indices) + 1, r0: 1, r1: rows }
        : { c0: 1, c1: columns, r0: Math.min(...selection.indices) + 1, r1: Math.max(...selection.indices) + 1 };
    default:
      return null;
  }
};

export { selectionBounds };
