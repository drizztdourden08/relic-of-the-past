/* @layer shared-game @kind logic */
import { CANONICAL_SLOTS } from './shop-slot-facts.constants';
import type { ShopSlotFacts } from '../shop-slot.type';

const slotsOfShop = (shopId: string): readonly ShopSlotFacts[] =>
  CANONICAL_SLOTS.filter((row) => row.shopId === shopId);

export { slotsOfShop };
