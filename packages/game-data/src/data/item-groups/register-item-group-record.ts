/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import type { ItemGroupRecord } from '../types/item-group';
import { ALL_ITEM_GROUPS } from './item-groups.constants';
import { itemGroupByIdMap } from './item-group-by-id-map';

const registerItemGroupRecord = (record: ItemGroupRecord): boolean => {
  if (itemGroupByIdMap.has(record.id)) return false;
  ALL_ITEM_GROUPS.push(record);
  itemGroupByIdMap.set(record.id, record);
  replaceAll('item-group', ALL_ITEM_GROUPS);
  return true;
};

export { registerItemGroupRecord };
