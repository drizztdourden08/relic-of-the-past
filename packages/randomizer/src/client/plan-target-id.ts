/* @layer bridge-wasm @kind logic */
import { isForeignItem } from '../archipelago/foreign-item';
import { itemKeyName } from '../world/display-names/item-key-name';
import { FOREIGN_ITEM_ID } from '../foreign-items/foreign-item-sentinel';
import { resolveServerItemLocalId } from './online-items';
import type { ItemKey } from '../world/item-ids';

const targetLocalIdOf = (item: ItemKey): number | undefined =>
  (isForeignItem(item) ? FOREIGN_ITEM_ID : resolveServerItemLocalId(itemKeyName(item)));

export { targetLocalIdOf };
