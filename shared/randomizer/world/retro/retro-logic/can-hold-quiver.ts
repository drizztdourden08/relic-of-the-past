/* @layer shared-game @kind logic */
import { RETRO_QUIVER_ITEM } from '../retro-bow.data';
import { retroQuiverInPool } from '../retro-shops';
import { canAffordShots } from './can-afford-shots';
import { canBuyQuiver } from './can-buy-quiver';
import type { CollectionState } from '../../collection-state';
import type { RetroBowSetting } from '../retro.type';

const canHoldQuiver = (state: CollectionState, setting: RetroBowSetting): boolean =>
  (retroQuiverInPool(state.world.options.shops, setting)
    ? state.has(RETRO_QUIVER_ITEM) && canAffordShots(state, setting)
    : canBuyQuiver(state, setting));

export { canHoldQuiver };
