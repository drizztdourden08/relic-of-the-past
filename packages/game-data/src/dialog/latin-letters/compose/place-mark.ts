/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import { columnExtent } from '../mask/column-extent';
import { maskBox } from '../mask/mask-box';
import type { MaskBox } from '../mask/mask.type';
import { paintArt } from '../mask/paint-art';
import type { MarkPlace } from '../latin-letters.type';
import { ABOVE_GAP, BELOW_GAP, BELOW_NUDGES } from './compose.constants';
import type { PlaceSpot, Placed } from './compose.type';

const widthOf = (rows: readonly string[]): number => Math.max(...rows.map((row) => row.length));
const clampX = (x: number, w: number): number => Math.max(0, Math.min(COLUMNS - w, x));
const centredX = (box: MaskBox, w: number): number =>
  clampX(box.left + Math.floor((box.right - box.left + 1 - w) / 2), w);

const above = ({ mask, box, w, h, strict }: PlaceSpot): Placed => {
  const x = centredX(box, w);
  const near = columnExtent(mask, x - 1, x + w) ?? { from: box.top, to: box.bottom };
  const y = near.from - ABOVE_GAP - h;
  if (y >= 0) return [x, y];
  return strict ? undefined : [x, 0];
};

const below = ({ mask, box, w, h, strict }: PlaceSpot): Placed => {
  const x0 = centredX(box, w);
  for (const nudge of BELOW_NUDGES) {
    const x = clampX(x0 + nudge, w);
    const near = columnExtent(mask, x - 1, x + w) ?? { from: box.top, to: box.bottom };
    const y = near.to + BELOW_GAP;
    if (y + h <= ROWS) return [x, y];
  }
  return strict ? undefined : [x0, ROWS - h];
};

const settleBelow = ({ mask, box, h, strict }: PlaceSpot, x: number, last: number): Placed => {
  const near = columnExtent(mask, x, last) ?? { from: box.top, to: box.bottom };
  const y = near.to + 1;
  if (y + h <= ROWS) return [x, y];
  return strict ? undefined : [x, ROWS - h];
};

const attached = (spot: PlaceSpot): Placed => {
  const x = centredX(spot.box, spot.w);
  return settleBelow(spot, x, x + spot.w - 1);
};

const ogonek = (spot: PlaceSpot): Placed => {
  const x = clampX(spot.box.right - 1, spot.w);
  return settleBelow(spot, x, x + 1);
};

const placerOf = (place: MarkPlace): ((spot: PlaceSpot) => Placed) => {
  if (place === 'above') return above;
  if (place === 'below') return below;
  if (place === 'attached') return attached;
  return ogonek;
};

const placeMark = (mask: Uint8Array, rows: readonly string[], place: MarkPlace, strict: boolean): Uint8Array | undefined => {
  const box = maskBox(mask);
  if (box === undefined) return undefined;
  const at = placerOf(place)({ mask, box, w: widthOf(rows), h: rows.length, strict });
  if (at === undefined) return undefined;
  const out = mask.slice();
  paintArt(out, rows, at[0], at[1]);
  return out;
};

export { placeMark };
