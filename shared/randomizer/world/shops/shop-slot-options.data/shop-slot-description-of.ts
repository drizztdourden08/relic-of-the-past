/* @layer shared-game @kind logic */
import { itemKeyName } from '../../display-names/item-key-name';
import { UNKNOWN_STOCK } from './shop-slot-options.data';
import type { ShopSlotFacts } from '../shop-slot.type';

const stockNameOf = (slot: ShopSlotFacts): string =>
  (slot.vanillaItem === undefined ? UNKNOWN_STOCK : itemKeyName(slot.vanillaItem));

const shopSlotDescriptionOf = (slot: ShopSlotFacts): string => `Normally sells ${stockNameOf(slot)}.`;

export { shopSlotDescriptionOf };
