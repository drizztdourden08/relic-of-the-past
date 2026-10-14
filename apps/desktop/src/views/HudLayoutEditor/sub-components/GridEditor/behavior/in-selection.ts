/* @layer renderer-components @kind logic */
import type { CellRef, GridSelection } from '../GridEditor.type';

const inSelection = (selection: GridSelection, cell: CellRef): boolean => {
  switch (selection.kind) {
    case 'cells':
      return selection.cells.some((c) => c.column === cell.column && c.row === cell.row);
    case 'track':
      return selection.indices.includes((selection.axis === 'columns' ? cell.column : cell.row) - 1);
    case 'none':
      return false;
  }
};

export { inSelection };
