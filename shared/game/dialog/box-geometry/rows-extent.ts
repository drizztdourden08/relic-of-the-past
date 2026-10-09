/* @layer shared-game @kind logic */
import type { DialogCell } from '../dialog-frame.types';

const rowsExtent = (rows: DialogCell[][]): number =>
  rows.reduce((widest, row) => row.reduce((edge, cell) => Math.max(edge, cell.x + cell.w), widest), 0);

export { rowsExtent };
