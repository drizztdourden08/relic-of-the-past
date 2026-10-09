/* @layer shared-game @kind logic */
import { hasSword } from '../state-helpers';
import { itemPowerOf } from '../item-power/item-power-rule';
import type { CollectionState } from '../collection-state.type';

const canUseMedallion = (state: CollectionState): boolean =>
  itemPowerOf(state.world).swordlessMedallions || hasSword(state);

export { canUseMedallion };
