/* @layer renderer-components @kind logic */
import type { OverlayLayout } from '../PadOverlay.type';

const leaderLength = (layout: OverlayLayout): number =>
  layout.labels.reduce((sum, label) => sum + label.leader.slice(1).reduce((run, point, index) => {
    const from = label.leader[index] ?? point;
    return run + Math.hypot(point.x - from.x, point.y - from.y);
  }, 0), 0);

export { leaderLength };
