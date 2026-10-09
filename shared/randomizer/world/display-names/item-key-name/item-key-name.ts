/* @layer shared-game @kind logic */
import { getItem } from '@shared/game/data';
import { FOREIGN_ITEM_NAME, isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { isUnrecordedItem, nameOfUnrecorded } from '../../item-ids.data';
import type { ItemKey } from '../../item-ids.data';

const itemKeyName = (item: ItemKey): string => {
  if (isForeignItem(item)) return FOREIGN_ITEM_NAME;
  return isUnrecordedItem(item) ? nameOfUnrecorded(item) : getItem(item).name;
};

export { itemKeyName };
