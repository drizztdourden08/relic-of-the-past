/* @layer bridge-wasm @kind logic */
import { isForeignItem } from '../archipelago/foreign-item';
import { itemKeyName } from '../world/display-names/item-key-name';
import type { ItemKey } from '../world/item-ids';

const planItemLabel = (item: ItemKey): string => (isForeignItem(item) ? 'another player\'s item' : itemKeyName(item));

export { planItemLabel };
