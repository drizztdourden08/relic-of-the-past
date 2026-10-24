/* @layer renderer-components @kind logic */
import { TEXT_GAP } from '../PadOverlay.constants';
import type { LabelSide, OverlayFrame, PlacedLabel, PlacedLine } from '../PadOverlay.type';
import { leaderPoints } from './leader-points';

const placedLabel = ({ part, y }: PlacedLine, side: LabelSide, frame: OverlayFrame): PlacedLabel => {
  const leader = leaderPoints(part, side, y, frame);
  const outward = side === 'left' ? -1 : 1;
  const detailDy = frame.mode === 'stacked' && part.slot.kind !== 'button' ? frame.lineGap : 0;
  return { part, side, leader, detailDy, text: { x: leader[2].x + outward * TEXT_GAP, y } };
};

export { placedLabel };
