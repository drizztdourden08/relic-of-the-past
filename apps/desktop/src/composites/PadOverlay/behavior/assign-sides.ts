/* @layer renderer-components @kind logic */
import { CENTRE_BAND } from './slot-anchors.constants';
import type { LabelSide, PlacedPart } from '../PadOverlay.type';

const settledSide = (part: PlacedPart, middle: number): LabelSide | undefined => {
  const half = CENTRE_BAND / 2;
  if (part.slot.side) return part.slot.side;
  if (part.x < middle - half) return 'left';
  if (part.x > middle + half) return 'right';
  return undefined;
};

const assignSides = (parts: readonly PlacedPart[], middle: number): Map<string, LabelSide> => {
  const sides = new Map<string, LabelSide>();
  const counts = { left: 0, right: 0 };

  for (const part of parts) {
    const side = settledSide(part, middle);
    if (!side) continue;
    sides.set(part.slot.anchor, side);
    counts[side] += 1;
  }
  for (const part of [...parts].sort((a, b) => a.y - b.y)) {
    if (sides.has(part.slot.anchor)) continue;
    const side: LabelSide = counts.left <= counts.right ? 'left' : 'right';
    sides.set(part.slot.anchor, side);
    counts[side] += 1;
  }
  return sides;
};

export { assignSides };
