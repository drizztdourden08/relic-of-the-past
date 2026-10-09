/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { DOOR_REACH_RADIUS, INWARD } from './place-tile.constants';
import { inGrid } from './in-grid';
import { isReached } from './is-reached';
import type { DoorSide, Landing } from './place-tile.type';

const isBetterLanding = (candidate: Landing, best: Landing | null): boolean => {
  if (!best) return true;
  const onSide = candidate.inward > 0;
  if (onSide !== best.inward > 0) return onSide;
  const depth = Math.abs(candidate.inward);
  const bestDepth = Math.abs(best.inward);
  if (depth !== bestDepth) return depth < bestDepth;
  return Math.abs(candidate.lateral) < Math.abs(best.lateral);
};

const measuredLanding = (
  from: GridPos,
  side: DoorSide,
  reachable: readonly ReachState[][] | undefined,
  radius = DOOR_REACH_RADIUS,
): GridPos | null => {
  const step = INWARD[side];
  let best: Landing | null = null;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) continue;
      const tile = { row: from.row + dr, col: from.col + dc };
      if (!inGrid(tile) || !isReached(reachable, tile.row, tile.col)) continue;
      const candidate: Landing = {
        tile,
        inward: dr * step.row + dc * step.col,
        lateral: dr * step.col + dc * step.row,
      };
      if (isBetterLanding(candidate, best)) best = candidate;
    }
  }
  return best?.tile ?? null;
};

export { measuredLanding };
