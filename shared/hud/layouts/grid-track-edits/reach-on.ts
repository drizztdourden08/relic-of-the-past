/* @layer shared-hud @kind logic */
import { SPAN, START } from './grid-track-edits.constants';
import type { HudNode } from '../../../types/hud';
import type { TrackAxis } from './grid-track-edits.type';

const reachOn = (children: readonly HudNode[], axis: TrackAxis): number => children.reduce(
  (most, child) => {
    const place = child.place;
    if (!place) return most;
    const start = place[START[axis]] ?? 1;
    const span = place[SPAN[axis]] ?? 1;
    return Math.max(most, start + span - 1);
  },
  0,
);

export { reachOn };
