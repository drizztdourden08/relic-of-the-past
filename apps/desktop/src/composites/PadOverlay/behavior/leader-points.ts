/* @layer renderer-components @kind logic */
import { LEADER_GAP, SILHOUETTE_WIDTH } from '../PadOverlay.constants';
import type { LabelSide, Leader, OverlayBox, PlacedPart } from '../PadOverlay.type';

const leaderPoints = (part: PlacedPart, side: LabelSide, labelY: number, box: OverlayBox): Leader => {
  const outward = side === 'left' ? -1 : 1;
  const edgeX = side === 'left' ? box.gutter : box.gutter + SILHOUETTE_WIDTH;
  const elbow = { x: edgeX, y: labelY };
  const reach = Math.hypot(elbow.x - part.x, elbow.y - part.y) || 1;
  const gap = part.radius + LEADER_GAP;
  const start = {
    x: part.x + ((elbow.x - part.x) / reach) * gap,
    y: part.y + ((elbow.y - part.y) / reach) * gap,
  };
  return [start, elbow, { x: edgeX + outward * box.elbow, y: labelY }];
};

export { leaderPoints };
