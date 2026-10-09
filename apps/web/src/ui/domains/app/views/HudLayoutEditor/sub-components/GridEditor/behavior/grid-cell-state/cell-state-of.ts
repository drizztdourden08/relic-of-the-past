/* @layer renderer-components @kind logic */
import { covers } from '../../../GridLattice';
import { inSelection } from './in-selection';
import type { LatticeCellState } from '../../../GridLattice';
import type { CellRef, GridSelection, Occupant } from '../../GridEditor.type';

const cellStateOf = (
  selection: GridSelection, occupants: readonly Occupant[], cell: CellRef,
): LatticeCellState => {
  const taken = occupants.some((o) => covers(o, cell.column, cell.row));
  const selected = inSelection(selection, cell);
  if (selected) return taken ? 'occupied-selected' : 'selected';
  return taken ? 'occupied' : 'empty';
};

export { cellStateOf };
