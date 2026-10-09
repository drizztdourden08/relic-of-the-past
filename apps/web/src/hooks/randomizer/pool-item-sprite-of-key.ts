/* @layer renderer-hooks @kind logic */
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import { poolItemSpriteOf } from './pool-item-sprite';

const poolItemSpriteOfKey = (item: ItemKey): string | undefined => poolItemSpriteOf(itemKeyName(item));

export { poolItemSpriteOfKey };
