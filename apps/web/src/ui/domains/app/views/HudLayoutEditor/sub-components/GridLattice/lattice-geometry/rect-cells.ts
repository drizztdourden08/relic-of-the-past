/* @layer renderer-components @kind logic */
import type { CellRef } from './lattice-geometry.type';

const rectCells = (a: CellRef, b: CellRef): CellRef[] => {
  const out: CellRef[] = [];
  for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row += 1) {
    for (let column = Math.min(a.column, b.column); column <= Math.max(a.column, b.column); column += 1) {
      out.push({ column, row });
    }
  }
  return out;
};

export { rectCells };
