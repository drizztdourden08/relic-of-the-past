/* @layer shared-game @kind data */
import { collectRecords } from '../collect-records';
import { ITEM_GROUP_IDS } from './ids';
import type { ItemGroupRecord } from '../types/item-group';

const files = import.meta.glob('../records/item-groups/item-groups.ts', { eager: true });

const ALL_ITEM_GROUPS: ItemGroupRecord[] = collectRecords<ItemGroupRecord>(files);

export { ALL_ITEM_GROUPS, ITEM_GROUP_IDS };
