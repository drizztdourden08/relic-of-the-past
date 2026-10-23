/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayBox, PlacedLine } from '../PadOverlay.type';
import { leaderPoints } from './leader-points';
import { segmentsCross } from './segments-cross';

const linesCross = (first: PlacedLine, second: PlacedLine, side: LabelSide, box: OverlayBox): boolean => {
  const [a, b] = leaderPoints(first.part, side, first.y, box);
  const [c, d] = leaderPoints(second.part, side, second.y, box);
  return segmentsCross(a, b, c, d);
};

export { linesCross };
