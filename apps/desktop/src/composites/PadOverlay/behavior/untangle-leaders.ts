/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayBox, PlacedLabel, PlacedPart } from '../PadOverlay.type';
import { placedLabel } from './placed-label';
import { swapCrossing } from './swap-crossing';

const untangleLeaders = (
  order: readonly PlacedPart[], ys: readonly number[], side: LabelSide, box: OverlayBox,
): PlacedLabel[] => {
  const lines = order.map((part, index) => ({ part, y: ys[index] ?? part.y }));
  let passes = lines.length;
  while (passes > 0 && swapCrossing(lines, side, box)) passes -= 1;
  return lines.map((line) => placedLabel(line, side, box));
};

export { untangleLeaders };
