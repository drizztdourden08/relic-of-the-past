/* @layer shared-game @kind logic */
import type { BoxRow, Pen } from './box-pen.type';

const slotAt = (pen: Pen, row: number): BoxRow => {
  const slot = pen.slots[row - 1];
  if (slot === undefined) throw new Error(`The text box has no row ${String(row)}`);
  return slot;
};

export { slotAt };
