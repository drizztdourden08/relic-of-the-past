/* @layer renderer-components @kind logic */
import { ELBOW, LEADER_GAP } from '../PadOverlay.constants';
import type { LabelSide, Leader, OverlayFrame, PlacedPart } from '../PadOverlay.type';

const leaderPoints = (part: PlacedPart, side: LabelSide, labelY: number, frame: OverlayFrame): Leader => {
  const outward = side === 'left' ? -1 : 1;
  const edgeX = frame.edge(side, labelY, part) + outward * LEADER_GAP * 2;
  const elbow = { x: edgeX, y: labelY };
  const reach = Math.hypot(elbow.x - part.x, elbow.y - part.y) || 1;
  const gap = part.radius + LEADER_GAP;
  const start = {
    x: part.x + ((elbow.x - part.x) / reach) * gap,
    y: part.y + ((elbow.y - part.y) / reach) * gap,
  };
  return [start, elbow, { x: edgeX + outward * ELBOW, y: labelY }];
};

export { leaderPoints };
