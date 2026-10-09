/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation } from '../../../simulation';
import type { ReachState } from '@rotp/game-core';
import { PHYSICAL, SCREEN_WIDE } from './reachability.constants';
import { reachableNear } from './reachable-near';

const markUnreachable = (items: ScreenAnnotation[], reachable?: readonly ReachState[][]): void => {
  if (!reachable) return;
  for (const item of items) {
    if (item.state === 'done' || SCREEN_WIDE.has(item.kind)) continue;
    if (reachableNear(reachable, item.tile.row, item.tile.col)) continue;
    if (PHYSICAL.has(item.kind)) {
      item.detail = item.detail ? `${item.detail} · unreachable` : 'unreachable';
      continue;
    }
    item.state = 'blocked';
  }
};

export { markUnreachable };
