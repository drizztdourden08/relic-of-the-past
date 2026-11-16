/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import { columnExtent } from '../mask/column-extent';
import { maskBox } from '../mask/mask-box';
import type { MaskBox } from '../mask/mask.type';
import { paintArt } from '../mask/paint-art';
import type { MarkPlace } from '../latin-letters.type';
import { ABOVE_GAP, BELOW_GAP, BELOW_NUDGES } from './compose.constants';

type Placed = readonly [number, number] | undefined;

const widthOf = (rows: readonly string[]): number => Math.max(...rows.map((row) => row.length));
const clampX = (x: number, w: number): number => Math.max(0, Math.min(COLUMNS - w, x));
const centredX = (box: MaskBox, w: number): number =>
  clampX(box.left + Math.floor((box.right - box.left + 1 - w) / 2), w);

const above = (mask: Uint8Array, box: MaskBox, w: number, h: number, strict: boolean): Placed => {
  const x = centredX(box, w);
  const near = columnExtent(mask, x - 1, x + w) ?? { from: box.top, to: box.bottom };
  const y = near.from - ABOVE_GAP - h;
  if (y >= 0) return [x, y];
  return strict ? undefined : [x, 0];
};

const below = (mask: Uint8Array, box: MaskBox, w: number, h: number, strict: boolean): Placed => {
  const x0 = centredX(box, w);
  for (const nudge of BELOW_NUDGES) {
    const x = clampX(x0 + nudge, w);
    const near = columnExtent(mask, x - 1, x + w) ?? { from: box.top, to: box.bottom };
    const y = near.to + BELOW_GAP;
    if (y + h <= ROWS) return [x, y];
  }
  return strict ? undefined : [x0, ROWS - h];
};

const attached = (mask: Uint8Array, box: MaskBox, w: number, h: number, strict: boolean): Placed => {
  const x = centredX(box, w);
  const near = columnExtent(mask, x, x + w - 1) ?? { from: box.top, to: box.bottom };
  const y = near.to + 1;
  if (y + h <= ROWS) return [x, y];
  return strict ? undefined : [x, ROWS - h];
};

const ogonek = (mask: Uint8Array, box: MaskBox, w: number, h: number, strict: boolean): Placed => {
  const x = clampX(box.right - 1, w);
  const near = columnExtent(mask, x, x + 1) ?? { from: box.top, to: box.bottom };
  const y = near.to + 1;
  if (y + h <= ROWS) return [x, y];
  return strict ? undefined : [x, ROWS - h];
};

const PLACERS = { above, below, attached, ogonek } as const;

const placeMark = (mask: Uint8Array, rows: readonly string[], place: MarkPlace, strict: boolean): Uint8Array | undefined => {
  const box = maskBox(mask);
  if (box === undefined) return undefined;
  const at = PLACERS[place](mask, box, widthOf(rows), rows.length, strict);
  if (at === undefined) return undefined;
  const out = mask.slice();
  paintArt(out, rows, at[0], at[1]);
  return out;
};

export { placeMark };
