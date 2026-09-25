/* @layer renderer-components @kind logic */
/**
 * What a cell looks like, and the one rectangle the stage echoes.
 *
 * TWO FACTS, FOUR STATES. Is this cell in the selection, and is a child standing
 * in it? The two are crossed, not enumerated. §48's fourth state was `coplace`, an
 * armed placement aimed at an occupied cell; §50 deleted every placement from
 * this editor, so the fourth state is the honest crossing of the two facts that
 * remain, and occupancy is drawn purely so a track edit's blast radius is
 * visible before the button is pressed.
 */
import { boundsOf, covers } from '../../GridLattice';
import type { LatticeCellState } from '../../GridLattice';
import type { CellBounds, CellRef, Occupant } from '../../GridLattice';
import type { GridSelection } from '../GridEditor.type';

const inSelection = (selection: GridSelection, cell: CellRef): boolean => {
  switch (selection.kind) {
    case 'cells':
      return selection.cells.some((c) => c.column === cell.column && c.row === cell.row);
    case 'track':
      return selection.indices.includes((selection.axis === 'columns' ? cell.column : cell.row) - 1);
    default:
      return false;
  }
};

const cellStateOf = (
  selection: GridSelection, occupants: readonly Occupant[], cell: CellRef,
): LatticeCellState => {
  const taken = occupants.some((o) => covers(o, cell.column, cell.row));
  const selected = inSelection(selection, cell);
  if (selected) return taken ? 'occupied-selected' : 'selected';
  return taken ? 'occupied' : 'empty';
};

/** Contiguous by construction for a track, and the hull of whatever the pointer
 *  collected for cells. `StageGridEcho` washes this rectangle. */
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

export { cellStateOf, inSelection, selectionBounds };
