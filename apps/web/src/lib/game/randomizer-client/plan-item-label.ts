/* @layer bridge-wasm @kind logic */
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';

const planItemLabel = (item: ItemKey): string => (isForeignItem(item) ? 'another player\'s item' : itemKeyName(item));

export { planItemLabel };
