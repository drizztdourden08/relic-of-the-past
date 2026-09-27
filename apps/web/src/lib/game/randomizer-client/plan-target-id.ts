/* @layer bridge-wasm @kind logic */
/**
 * The id an override arms for a planned item: the native grant id its name resolves to, or
 * the core's foreign-item sentinel for another player's item (an online placement only). The
 * setters check the sentinel against the core's own WasmForeignItemId before arming it.
 */
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { FOREIGN_ITEM_ID } from '../foreign-item-sentinel';
import { resolveServerItemLocalId } from './online-items';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';

const targetLocalIdOf = (item: ItemKey): number | undefined =>
  (isForeignItem(item) ? FOREIGN_ITEM_ID : resolveServerItemLocalId(itemKeyName(item)));

/** What a plan error calls the item. */
const planItemLabel = (item: ItemKey): string => (isForeignItem(item) ? 'another player\'s item' : itemKeyName(item));

export { planItemLabel, targetLocalIdOf };
