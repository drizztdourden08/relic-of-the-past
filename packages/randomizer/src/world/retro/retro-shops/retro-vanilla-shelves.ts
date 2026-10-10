/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { CANONICAL_SLOTS } from '../../shops/shop-slot-facts';
import { RETRO_QUIVER_PRICE } from '../retro-bow.constants';
import { RETRO_REFILL_ITEM } from '../retro-shelf.constants';
import { ARROW_SLOT_INDEXES, RETRO_QUIVER_SLOT_INDEX } from './retro-shops.constants';
import { shopsShuffled } from './shops-shuffled';
import type { ShopScope } from '../../shops/shop-scope.type';
import type { RetroBowSetting, RetroShelfStock } from '../retro.type';

const retroVanillaShelves = (scope: ShopScope, setting: RetroBowSetting): readonly RetroShelfStock[] => {
  if (!setting.enabled || shopsShuffled(scope)) return [];
  return ARROW_SLOT_INDEXES.map((index) => {
    const quiver = index === RETRO_QUIVER_SLOT_INDEX;
    const slot = itemAt(CANONICAL_SLOTS, index);
    return {
      ...slot,
      role: quiver ? 'quiver' : 'refill',
      refillItem: RETRO_REFILL_ITEM,
      refillPrice: slot.price,
      quiverPrice: quiver ? RETRO_QUIVER_PRICE : 0,
    };
  });
};

export { retroVanillaShelves };
