/* @layer shared-game @kind logic */
import { getItem } from '../../../data';
import type { InventorySlot, ItemId } from '../../../data';
import { itemSpriteFile } from './item-sprite-file';
import type { ResolvedItemSprite } from './item-sprites.type';

const resolveItemSprite = (slot: InventorySlot, inventory: ReadonlySet<ItemId>): ResolvedItemSprite => {
  for (const itemId of slot.trackerItemIds) {
    if (inventory.has(itemId)) {
      const filename = itemSpriteFile(getItem(itemId));
      return { obtained: true, sprite: filename ?? slot.sprite };
    }
  }
  return { obtained: false, sprite: slot.sprite };
};

export { resolveItemSprite };
