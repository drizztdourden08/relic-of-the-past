/* @layer shared-game @kind logic */
import type { ItemGroupRecord } from '../types/item-group';
import { ALL_ITEM_GROUPS } from './item-groups.constants';

const itemGroupByIdMap = new Map<string, ItemGroupRecord>(ALL_ITEM_GROUPS.map(group => [group.id, group]));

export { itemGroupByIdMap };
