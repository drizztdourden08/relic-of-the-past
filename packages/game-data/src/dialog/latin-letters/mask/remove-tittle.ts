/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';

const firstGap = (mask: Uint8Array): number | undefined => {
  let seen = false;
  for (let y = 0; y < ROWS; y++) {
    let filled = false;
    for (let x = 0; x < COLUMNS; x++) if (mask[y * COLUMNS + x] === 1) filled = true;
    if (filled) seen = true;
    else if (seen) return y;
  }
  return undefined;
};

const removeTittle = (mask: Uint8Array): Uint8Array => {
  const gap = firstGap(mask);
  if (gap === undefined) return mask;
  const below = mask.subarray(gap * COLUMNS);
  if (!below.includes(1)) return mask;
  const out = mask.slice();
  out.fill(0, 0, gap * COLUMNS);
  return out;
};

export { removeTittle };
