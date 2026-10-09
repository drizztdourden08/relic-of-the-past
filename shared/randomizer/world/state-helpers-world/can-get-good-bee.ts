/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { BOTTLE_ITEMS } from '../item-groups';
import { REGION } from '../region-ids.data';
import { hasSword } from '../state-helpers';
import { isNotBunny } from './is-not-bunny';
import type { CollectionState } from '../collection-state.type';

const canGetGoodBee = (state: CollectionState): boolean => {
  const cave = state.world.regions.get(REGION.coldBeeCave);
  return cave !== undefined
    && state.hasGroup(BOTTLE_ITEMS)
    && state.has(ITEM.bugCatchingNet)
    && (state.has(ITEM.pegasusBoots) || (hasSword(state) && state.has(ITEM.quake)))
    && state.canReachRegion(cave.id)
    && isNotBunny(state, cave);
};

export { canGetGoodBee };
