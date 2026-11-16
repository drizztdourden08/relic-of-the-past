/* @layer shared-game @kind logic */
import { COLUMNS, ROWS, TILE_BYTES } from '../../extra-glyph-tiles.constants';
import { BODY_VALUE, LOWER_TILE_OFFSET } from './mask.constants';

const glyphMask = (sheet: Uint8Array, glyph: number): Uint8Array => {
  const mask = new Uint8Array(ROWS * COLUMNS);
  const top = (glyph & 0x70) * 2 + (glyph & 0xf);
  for (let y = 0; y < ROWS; y++) {
    const at = (top + (y >> 3) * LOWER_TILE_OFFSET) * TILE_BYTES + (y & 7) * 2;
    const plane0 = sheet[at] ?? 0;
    const plane1 = sheet[at + 1] ?? 0;
    for (let x = 0; x < COLUMNS; x++) {
      const value = ((plane0 >> (7 - x)) & 1) | (((plane1 >> (7 - x)) & 1) << 1);
      mask[y * COLUMNS + x] = value >= BODY_VALUE ? 1 : 0;
    }
  }
  return mask;
};

export { glyphMask };
