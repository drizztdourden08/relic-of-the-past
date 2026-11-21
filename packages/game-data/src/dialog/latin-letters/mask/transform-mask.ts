/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import { maskBox } from './mask-box';

const transformMask = (mask: Uint8Array, transform: 'mirror' | 'turn'): Uint8Array => {
  const box = maskBox(mask);
  if (box === undefined) return mask;
  const out = new Uint8Array(ROWS * COLUMNS);
  for (let y = box.top; y <= box.bottom; y++) {
    for (let x = box.left; x <= box.right; x++) {
      if (mask[y * COLUMNS + x] !== 1) continue;
      const tx = box.left + box.right - x;
      const ty = transform === 'turn' ? box.top + box.bottom - y : y;
      out[ty * COLUMNS + tx] = 1;
    }
  }
  return out;
};

export { transformMask };
