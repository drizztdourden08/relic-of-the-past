/* @layer shared-game @kind logic */
import { itemKeyName } from '../../display-names/item-key-name';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ShopSlotFacts } from '../shop-slot.type';

const shopSlotDescriptionOf = (slot: ShopSlotFacts): Message =>
  (slot.vanillaItem === undefined
    ? msg('randomizer-world:desc.shopSlotNone')
    : msg('randomizer-world:desc.shopSlot', { stock: itemKeyName(slot.vanillaItem) }));

export { shopSlotDescriptionOf };
