/* @layer renderer-components @kind logic */
import { boundsOf } from '../../../GridLattice';
import type { GridSelection } from '../../GridEditor.type';

const chipOf = (selection: GridSelection): string | null => {
  if (selection.kind === 'none') return null;
  if (selection.kind === 'track') {
    return selection.indices.length === 1
      ? `${selection.axis === 'columns' ? 'column' : 'row'} ${selection.indices[0] + 1}`
      : `${selection.indices.length} ${selection.axis}`;
  }
  const bounds = boundsOf(selection.cells);
  return selection.cells.length === 1
    ? `cell ${bounds.c0},${bounds.r0}`
    : `${selection.cells.length} cells`;
};

export { chipOf };
