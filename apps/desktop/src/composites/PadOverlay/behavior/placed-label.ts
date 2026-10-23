/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayBox, PlacedLabel, PlacedLine } from '../PadOverlay.type';
import { leaderPoints } from './leader-points';

const placedLabel = ({ part, y }: PlacedLine, side: LabelSide, box: OverlayBox): PlacedLabel => {
  const leader = leaderPoints(part, side, y, box);
  const outward = side === 'left' ? -1 : 1;
  return { part, side, leader, text: { x: leader[2].x + outward * box.textGap, y } };
};

export { placedLabel };
