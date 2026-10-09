/* @layer shared-game @kind logic */
import { getItem } from '../../../data';
import type { ItemId } from '../../../data';
import { itemSpriteFile } from './item-sprite-file';
import { spriteUrlOf } from './sprite-url-of';

const getItemSprite = (itemId: ItemId): string | undefined => {
  const filename = itemSpriteFile(getItem(itemId));
  if (!filename) return undefined;
  return spriteUrlOf(filename);
};

export { getItemSprite };
