/* @layer renderer-components @kind logic */
import { LABEL_SIDES } from '../PadOverlay.constants';
import type { LabelSide, OverlayBox, PlacedLabel, PlacedPart } from '../PadOverlay.type';
import { assignSides } from './assign-sides';
import { spreadColumn } from './spread-column';
import { untangleLeaders } from './untangle-leaders';

const byYThenOuter = (side: LabelSide) => (a: PlacedPart, b: PlacedPart): number =>
  a.y - b.y || (side === 'left' ? a.x - b.x : b.x - a.x);

const layoutLabels = (parts: readonly PlacedPart[], box: OverlayBox): PlacedLabel[] => {
  const sides = assignSides(parts, box);
  return LABEL_SIDES.flatMap((side) => {
    const column = parts.filter((part) => sides.get(part.slot.anchor) === side).sort(byYThenOuter(side));
    const bounds = { min: box.top, max: box.height - box.top, lineH: box.lineH, minLineH: box.minLineH };
    return untangleLeaders(column, spreadColumn(column.map((part) => part.y), bounds), side, box);
  });
};

export { layoutLabels };
