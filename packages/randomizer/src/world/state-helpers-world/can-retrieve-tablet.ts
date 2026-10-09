/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids';
import { hasBeamSword } from '../state-helpers';
import { itemPowerOf } from '../item-power/item-power-rule';
import type { CollectionState } from '../collection-state.type';

const canRetrieveTablet = (state: CollectionState): boolean =>
  state.has(ITEM.bookOfMudora)
  && (hasBeamSword(state) || (itemPowerOf(state.world).hammerTablets && state.has(ITEM.hammer)));

export { canRetrieveTablet };
