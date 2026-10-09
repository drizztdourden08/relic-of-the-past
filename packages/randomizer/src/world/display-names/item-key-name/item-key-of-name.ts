/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import { unrecordedItem } from '../../item-ids';
import type { ItemId } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids';

let itemIdByName: Map<string, ItemId> | null = null;

const itemKeyOfName = (name: string): ItemKey => {
  itemIdByName ??= new Map(all('item').map((item) => [item.name, item.id]));
  return itemIdByName.get(name) ?? unrecordedItem(name);
};

export { itemKeyOfName };
