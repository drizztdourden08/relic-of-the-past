/* @layer shared-game @kind constants */
import { itemKeyName } from '../display-names/item-key-name';
import { CANONICAL_SLOTS } from '../shops/shop-slot-facts';
import { BOTTLE_LABEL_OF } from './bottle-labels.constants';
import { contentOfStock } from './content-of-stock';
import type { PotionCauldron } from './potion-cauldron.type';

const POTION_CAULDRONS: readonly PotionCauldron[] = CANONICAL_SLOTS.flatMap((slot) => {
  if (slot.seam !== 'cauldron') return [];
  const content = slot.vanillaItem === undefined ? undefined : contentOfStock(itemKeyName(slot.vanillaItem));
  return content === undefined
    ? []
    : [{
      canonicalIndex: slot.canonicalIndex,
      content,
      label: BOTTLE_LABEL_OF.get(content) ?? content,
      price: slot.price,
    }];
});

export { POTION_CAULDRONS };
