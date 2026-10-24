/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayFrame, PlacedLabel, PlacedPart } from '../PadOverlay.type';
import { placedLabel } from './placed-label';
import { swapCrossing } from './swap-crossing';

const untangleLeaders = (
  order: readonly PlacedPart[], ys: readonly number[], side: LabelSide, frame: OverlayFrame,
): PlacedLabel[] => {
  const lines = order.map((part, index) => ({ part, y: ys[index] ?? part.y }));
  let passes = lines.length;
  while (passes > 0 && swapCrossing(lines, side, frame)) passes -= 1;
  return lines.map((line) => placedLabel(line, side, frame));
};

export { untangleLeaders };
