/* @layer shared-game @kind logic */
import type { ItemGroupRecord } from '../types/item-group';
import { itemGroupByIdMap } from './item-group-by-id-map';

const itemGroupById = (id: string): ItemGroupRecord | undefined => itemGroupByIdMap.get(id);

export { itemGroupById };
