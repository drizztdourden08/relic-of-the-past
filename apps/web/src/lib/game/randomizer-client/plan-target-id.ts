/* @layer bridge-wasm @kind logic */
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { FOREIGN_ITEM_ID } from '../foreign-item-sentinel';
import { resolveServerItemLocalId } from './online-items';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';

const targetLocalIdOf = (item: ItemKey): number | undefined =>
  (isForeignItem(item) ? FOREIGN_ITEM_ID : resolveServerItemLocalId(itemKeyName(item)));

export { targetLocalIdOf };
