/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import type { Extent } from './mask.type';

const rowExtent = (mask: Uint8Array, y0: number, y1: number): Extent | undefined => {
  let from = COLUMNS;
  let to = -1;
  for (let y = Math.max(0, y0); y <= Math.min(ROWS - 1, y1); y++) {
    for (let x = 0; x < COLUMNS; x++) {
      if (mask[y * COLUMNS + x] !== 1) continue;
      from = Math.min(from, x);
      to = Math.max(to, x);
    }
  }
  return to < 0 ? undefined : { from, to };
};

export { rowExtent };
