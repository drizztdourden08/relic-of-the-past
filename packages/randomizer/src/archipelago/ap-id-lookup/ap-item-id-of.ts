/* @layer shared-game @kind logic */
import { ITEM_ID_BY_KEY } from './ap-id-lookup.constants';
import { lookupOrThrow } from './lookup-or-throw';
import type { ItemKey } from '../../world/item-ids';

const apItemIdOf = (key: ItemKey): number => lookupOrThrow(ITEM_ID_BY_KEY, key, 'item id for');

export { apItemIdOf };
