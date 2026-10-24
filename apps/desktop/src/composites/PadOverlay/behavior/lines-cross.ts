/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayFrame, PlacedLine } from '../PadOverlay.type';
import { leaderPoints } from './leader-points';
import { segmentsCross } from './segments-cross';

const linesCross = (first: PlacedLine, second: PlacedLine, side: LabelSide, frame: OverlayFrame): boolean => {
  const [a, b] = leaderPoints(first.part, side, first.y, frame);
  const [c, d] = leaderPoints(second.part, side, second.y, frame);
  return segmentsCross(a, b, c, d);
};

export { linesCross };
