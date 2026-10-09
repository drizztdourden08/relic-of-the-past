/* @layer shared-game @kind logic */
import type { ShopSlotFacts } from '../shop-slot.type';

const slugOf = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const shopSlotKeyOf = (slot: ShopSlotFacts): string =>
  (slot.position === 'Single'
    ? `shop_slot_${slugOf(slot.shopName)}`
    : `shop_slot_${slugOf(slot.shopName)}_${slot.position.toLowerCase()}`);

export { shopSlotKeyOf };
