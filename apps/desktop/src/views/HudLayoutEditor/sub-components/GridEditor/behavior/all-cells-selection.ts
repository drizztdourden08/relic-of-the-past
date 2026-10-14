/* @layer renderer-components @kind logic */
import type { GridSelection } from '../GridEditor.type';

const allCellsSelection = (columns: number, rows: number): GridSelection => ({
  kind: 'cells',
  cells: Array.from({ length: columns * rows }, (_unused, i) => ({
    column: (i % columns) + 1,
    row: Math.floor(i / columns) + 1,
  })),
  anchor: { column: 1, row: 1 },
});

export { allCellsSelection };
