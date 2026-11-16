/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';

const shiftMask = (mask: Uint8Array, by: number): Uint8Array => {
  const out = new Uint8Array(ROWS * COLUMNS);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      const tx = x + by;
      if (mask[y * COLUMNS + x] === 1 && tx >= 0 && tx < COLUMNS) out[y * COLUMNS + tx] = 1;
    }
  }
  return out;
};

export { shiftMask };
