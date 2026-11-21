/* @layer shared-game @kind logic */
import { maskBox } from '../mask/mask-box';
import { paintPoints } from '../mask/paint-points';
import { removeTittle } from '../mask/remove-tittle';
import { shiftMask } from '../mask/shift-mask';
import type { MarkedMask, OverlayId } from '../latin-letters.type';
import { overlayPoints } from './overlay-points';
import { LEADING_APOSTROPHE_SHIFT } from './compose.constants';

const leadingApostrophe = (mask: Uint8Array): MarkedMask | undefined => {
  const shifted = shiftMask(mask, LEADING_APOSTROPHE_SHIFT);
  const box = maskBox(shifted);
  if (box === undefined || box.top < 3) return undefined;
  paintPoints(shifted, [[1, box.top - 3], [1, box.top - 2]]);
  return { mask: shifted, shift: LEADING_APOSTROPHE_SHIFT };
};

const applyOverlay = (mask: Uint8Array, overlay: OverlayId): MarkedMask | undefined => {
  if (overlay === 'dotless') return { mask: removeTittle(mask), shift: 0 };
  if (overlay === 'apostropheLeft') return leadingApostrophe(mask);
  const box = maskBox(mask);
  if (box === undefined) return undefined;
  const points = overlayPoints(overlay, mask, box);
  if (points === undefined) return undefined;
  const out = mask.slice();
  paintPoints(out, points);
  return { mask: out, shift: 0 };
};

export { applyOverlay };
