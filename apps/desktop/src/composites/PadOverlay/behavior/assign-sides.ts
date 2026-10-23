/* @layer renderer-components @kind logic */
import { SILHOUETTE_WIDTH } from '../PadOverlay.constants';
import type { LabelSide, OverlayBox, PlacedPart } from '../PadOverlay.type';

const settledSide = (part: PlacedPart, box: OverlayBox): LabelSide | undefined => {
  const middle = box.gutter + SILHOUETTE_WIDTH / 2;
  const half = box.centreBand / 2;
  if (part.slot.side) return part.slot.side;
  if (part.x < middle - half) return 'left';
  if (part.x > middle + half) return 'right';
  return undefined;
};

const assignSides = (parts: readonly PlacedPart[], box: OverlayBox): Map<string, LabelSide> => {
  const sides = new Map<string, LabelSide>();
  const counts = { left: 0, right: 0 };

  for (const part of parts) {
    const side = settledSide(part, box);
    if (!side) continue;
    sides.set(part.slot.anchor, side);
    counts[side] += 1;
  }
  for (const part of parts) {
    if (sides.has(part.slot.anchor)) continue;
    const side: LabelSide = counts.left <= counts.right ? 'left' : 'right';
    sides.set(part.slot.anchor, side);
    counts[side] += 1;
  }
  return sides;
};

export { assignSides };
