/* @layer renderer-components @kind logic */
import { LABEL_SIDES } from '../PadOverlay.constants';
import type { LabelSide, OverlayFrame, PlacedLabel, PlacedPart } from '../PadOverlay.type';
import { spreadColumn } from './spread-column';
import { untangleLeaders } from './untangle-leaders';

const byYThenOuter = (side: LabelSide) => (a: PlacedPart, b: PlacedPart): number =>
  a.y - b.y || (side === 'left' ? a.x - b.x : b.x - a.x);

const layoutLabels = (parts: readonly PlacedPart[], sides: ReadonlyMap<string, LabelSide>, frame: OverlayFrame): PlacedLabel[] =>
  LABEL_SIDES.flatMap((side) => {
    const column = parts.filter((part) => sides.get(part.slot.anchor) === side).sort(byYThenOuter(side));
    const bounds = { min: frame.top, max: frame.bottom, lineH: frame.lineH, minLineH: frame.minLineH };
    return untangleLeaders(column, spreadColumn(column.map((part) => part.y), bounds), side, frame);
  });

export { layoutLabels };
