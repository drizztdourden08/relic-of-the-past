/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import { ALL_ITEM_GROUPS } from './item-groups.constants';
import { itemGroupByIdMap } from './item-group-by-id-map';

const unregisterItemGroupRecord = (id: string): boolean => {
  const index = ALL_ITEM_GROUPS.findIndex(group => group.id === id);
  if (index === -1) return false;
  ALL_ITEM_GROUPS.splice(index, 1);
  itemGroupByIdMap.delete(id);
  replaceAll('item-group', ALL_ITEM_GROUPS);
  return true;
};

export { unregisterItemGroupRecord };
