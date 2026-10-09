/* @layer shared-game @kind constants */
import { all } from '@rotp/game-data';
import type { ItemKey } from '../../item-ids.data';
import type {
  DungeonItemFamily, DungeonItemSetting,
} from '../dungeon-item.type';

const DUNGEON_ITEM_FAMILIES: readonly DungeonItemFamily[] = ['bigKey', 'smallKey', 'compass', 'map'];

const DUNGEON_ITEM_OPTION_KEYS: Readonly<Record<DungeonItemFamily, string>> = {
  bigKey: 'big_key_shuffle',
  smallKey: 'small_key_shuffle',
  compass: 'compass_shuffle',
  map: 'map_shuffle',
};

const DEFAULT_DUNGEON_ITEM_SETTING: DungeonItemSetting = {
  bigKey: 'original_dungeon',
  smallKey: 'original_dungeon',
  compass: 'original_dungeon',
  map: 'original_dungeon',
};

const REFUSED_MODES: Readonly<Record<string, string>> = {
  different_world: 'no second world exists in a single-player seed',
  start_with: 'no starting-inventory delivery exists',
  universal: 'no shared-key currency exists in the core',
};

const FAMILY_BY_ITEM: ReadonlyMap<ItemKey, DungeonItemFamily> = new Map(
  all('dungeon').flatMap((dungeon) => DUNGEON_ITEM_FAMILIES.flatMap((family) => {
    const item = dungeon.items[family];
    return item === null || item === undefined ? [] : [[item, family] as [ItemKey, DungeonItemFamily]];
  })),
);

export {
  DEFAULT_DUNGEON_ITEM_SETTING, DUNGEON_ITEM_FAMILIES, DUNGEON_ITEM_OPTION_KEYS, FAMILY_BY_ITEM, REFUSED_MODES,
};
