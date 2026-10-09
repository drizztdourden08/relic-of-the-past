/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SimChest } from '../../types';
import { planTrigger } from '../../trigger/trigger-plans/plan-trigger';
import type { Reached } from '../discover-reach/discover-reach.type';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope } from './discover.type';
import { FLOOD_GRID_SIZE } from './discover.constants';
import { chestKey } from './chest-key';
import { hasReachableOpenTile } from './has-reachable-open-tile';

const isOutOfFloodRange = (tile: GridPos): boolean =>
  tile.row < 0 || tile.row >= FLOOD_GRID_SIZE || tile.col < 0 || tile.col >= FLOOD_GRID_SIZE;

const chestReachable = (posKnown: boolean, reached: Reached, tile: GridPos): boolean =>
  !posKnown || isOutOfFloodRange(tile) || hasReachableOpenTile(reached, tile);

const chestLabel = (chest: SimChest): string => `chest (room ${chest.roomId.toString(16)} #${chest.chestIndex})`;

const chestTargets = ({ state, reached, inter, screenId, trapArm }: DiscoverScope): SimTarget[] => {
  const targets: SimTarget[] = [];
  for (const chest of inter.chests) {
    const key = chestKey(chest);
    if (chest.opened || state.done.has(key) || state.failed.has(key)) continue;
    if (!chestReachable(chest.posKnown, reached, chest.tile)) continue;
    const action = planTrigger(chest);
    if (action) {
      const tile = chest.posKnown ? chest.tile : undefined;
      targets.push({ screenId, roomId: chest.roomId, action, key, role: 'check', label: chestLabel(chest), noun: 'chest', verb: 'Opening', tile, trap: trapArm });
    }
  }
  return targets;
};

export { chestTargets };
