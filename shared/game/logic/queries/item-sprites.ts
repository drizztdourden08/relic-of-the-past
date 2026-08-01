/* @layer shared-game @kind logic */
import { getItem } from '../../data';
import type { InventorySlot, ItemId } from '../../data';

let spritesBase = '/sprites/items/';

const setSpritesBase = (base: string): void => {
  spritesBase = base;
};

const getSpritesBase = (): string => spritesBase;

/** Strips the `sprite-` id prefix down to the extracted PNG's filename. */
const spriteFilename = (spriteId: string | undefined): string | undefined =>
  spriteId ? spriteId.slice('sprite-'.length) : undefined;

const getItemSprite = (itemId: ItemId): string | undefined => {
  const filename = spriteFilename(getItem(itemId).spriteId);
  if (!filename) return undefined;
  return `${getSpritesBase()}${filename}.png`;
};

const resolveItemSprite = (slot: InventorySlot, inventory: ReadonlySet<ItemId>): { obtained: boolean; sprite: string } => {
  for (const itemId of slot.trackerItemIds) {
    if (inventory.has(itemId)) {
      const filename = spriteFilename(getItem(itemId).spriteId);
      return { obtained: true, sprite: filename ?? slot.sprite };
    }
  }
  return { obtained: false, sprite: slot.sprite };
};

export {
  getItemSprite,
  getSpritesBase,
  resolveItemSprite,
  setSpritesBase,
  spriteFilename,
};
