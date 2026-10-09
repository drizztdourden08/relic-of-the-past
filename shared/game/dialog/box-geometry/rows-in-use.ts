/* @layer shared-game @kind logic */
import type { DialogCell } from '../dialog-frame.types';

const rowsInUse = (rows: DialogCell[][]): number => {
  let last = 0;
  rows.forEach((row, index) => { if (row.length > 0) last = index + 1; });
  return Math.max(1, last);
};

export { rowsInUse };
