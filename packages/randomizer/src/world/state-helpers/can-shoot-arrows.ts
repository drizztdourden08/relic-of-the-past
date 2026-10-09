/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { projectilesCapacity } from '../state-helpers-capacity';
import { canHoldQuiver } from '../retro/retro-logic';
import { canHoldArrows } from './can-hold-arrows';
import type { CollectionState } from '../collection-state.type';

const canShootArrows = (state: CollectionState, count = 0): boolean => {
  if (!state.has(ITEM.bow) && !state.has(ITEM.silverBow)) return false;
  const retro = state.world.options.retroBow;
  if (retro?.enabled === true) return canHoldQuiver(state, retro);
  return projectilesCapacity(state) > 0 && canHoldArrows(state, count);
};

export { canShootArrows };
