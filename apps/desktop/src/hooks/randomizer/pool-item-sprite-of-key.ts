/* @layer renderer-hooks @kind logic */
import { itemKeyName } from '@rotp/randomizer';
import type { ItemKey } from '@rotp/randomizer';
import { poolItemSpriteOf } from './pool-item-sprite';

const poolItemSpriteOfKey = (item: ItemKey): string | undefined => poolItemSpriteOf(itemKeyName(item));

export { poolItemSpriteOfKey };
