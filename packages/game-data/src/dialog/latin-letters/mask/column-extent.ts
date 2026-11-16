/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import type { Extent } from './mask.type';

const columnExtent = (mask: Uint8Array, x0: number, x1: number): Extent | undefined => {
  let from = ROWS;
  let to = -1;
  for (let y = 0; y < ROWS; y++) {
    for (let x = Math.max(0, x0); x <= Math.min(COLUMNS - 1, x1); x++) {
      if (mask[y * COLUMNS + x] !== 1) continue;
      from = Math.min(from, y);
      to = Math.max(to, y);
    }
  }
  return to < 0 ? undefined : { from, to };
};

export { columnExtent };
