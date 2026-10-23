/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayBox, PlacedLine } from '../PadOverlay.type';
import { linesCross } from './lines-cross';

const swapCrossing = (lines: PlacedLine[], side: LabelSide, box: OverlayBox): boolean => {
  let swapped = false;
  lines.forEach((upper, index) => {
    const lower = lines[index + 1];
    if (!lower) return;
    const crossed = linesCross(upper, lower, side, box);
    const crossedSwapped = linesCross({ part: upper.part, y: lower.y }, { part: lower.part, y: upper.y }, side, box);
    if (!crossed || crossedSwapped) return;
    lines[index] = { part: lower.part, y: upper.y };
    lines[index + 1] = { part: upper.part, y: lower.y };
    swapped = true;
  });
  return swapped;
};

export { swapCrossing };
