/* @layer renderer-components @kind logic */
import type { CellRef } from './lattice-geometry.type';

const cellKey = (cell: CellRef): string => `${cell.column},${cell.row}`;

export { cellKey };
