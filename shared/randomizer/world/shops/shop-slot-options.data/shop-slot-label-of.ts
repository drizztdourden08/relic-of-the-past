/* @layer shared-game @kind logic */
import type { ShopSlotFacts } from '../shop-slot.type';

const shopSlotLabelOf = (slot: ShopSlotFacts): string =>
  (slot.position === 'Single' ? slot.shopName : `${slot.shopName}, ${slot.position}`);

export { shopSlotLabelOf };
