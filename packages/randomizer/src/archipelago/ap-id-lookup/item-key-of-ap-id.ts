/* @layer shared-game @kind logic */
import { ITEM_KEY_BY_ID } from './ap-id-lookup.constants';
import { lookupOrThrow } from './lookup-or-throw';
import type { ItemKey } from '../../world/item-ids.data';

const itemKeyOfApId = (id: number): ItemKey => lookupOrThrow(ITEM_KEY_BY_ID, id, 'item has id');

export { itemKeyOfApId };
