/* @layer shared-game @kind logic */
import { COLUMNS } from '../../extra-glyph-tiles.constants';
import { maskBox } from './mask-box';

const rowsMatch = (mask: Uint8Array, a: number, b: number): boolean => {
  for (let x = 0; x < COLUMNS; x++) if (mask[a * COLUMNS + x] !== mask[b * COLUMNS + x]) return false;
  return true;
};

const squashRow = (mask: Uint8Array, top: number, bottom: number): number => {
  const target = top + Math.floor((bottom - top) / 3);
  let best = target;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let y = top + 1; y < bottom; y++) {
    if (!rowsMatch(mask, y, y - 1) || Math.abs(y - target) >= bestDistance) continue;
    best = y;
    bestDistance = Math.abs(y - target);
  }
  return best;
};

const squashMask = (mask: Uint8Array): Uint8Array => {
  const box = maskBox(mask);
  if (box === undefined || box.bottom - box.top < 2) return mask;
  const out = mask.slice();
  const removed = squashRow(mask, box.top, box.bottom);
  out.copyWithin(COLUMNS, 0, removed * COLUMNS);
  out.fill(0, 0, COLUMNS);
  return out;
};

export { squashMask };
