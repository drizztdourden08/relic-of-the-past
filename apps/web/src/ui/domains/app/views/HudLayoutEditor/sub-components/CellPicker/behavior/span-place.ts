/* @layer renderer-components @kind logic */
import type { HudPlace } from '@shared/types/hud';
import type { CellRef } from '../../GridLattice';

const spanPlace = (a: CellRef, b: CellRef): HudPlace => {
  const column = Math.min(a.column, b.column);
  const row = Math.min(a.row, b.row);
  const colSpan = Math.abs(a.column - b.column) + 1;
  const rowSpan = Math.abs(a.row - b.row) + 1;
  return {
    column,
    row,
    ...(colSpan > 1 ? { colSpan } : {}),
    ...(rowSpan > 1 ? { rowSpan } : {}),
  };
};

export { spanPlace };
