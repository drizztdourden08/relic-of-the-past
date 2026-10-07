/* @layer shared-game @kind logic */
/**
 * What each dungeon-item mode means to the fill, transcribed from
 * Archipelago worlds/alttp/Options.py 170-213 and the generate_early block
 * that reads them (worlds/alttp/__init__.py):
 *
 *   for dungeon_item in (small_key_shuffle, big_key_shuffle,
 *                        compass_shuffle, map_shuffle):
 *       if option == "own_world":       local_items |= group
 *       elif option == "different_world": non_local_items |= group
 *       elif option.in_dungeon:         dungeon_local_item_names |= group
 *           if option == "original_dungeon":
 *               dungeon_specific_item_names |= group
 *
 * `in_dungeon` is values {0, 1} (Options.py 181-183), so:
 * - original_dungeon: the family is prefilled inside dungeons AND pinned to
 *   the dungeon that owns each item (the restrictive prefill's own-dungeon
 *   rule). This is the baseline every stored placement was rolled under.
 * - own_dungeons: still prefilled inside dungeons, but any dungeon will do.
 * - own_world / any_world: the family leaves the dungeon prefill and joins
 *   the global pool; in a one-world game those two are the same question, and
 *   `local_items` is what "own world" already means here.
 * - different_world: asks for the item to be placed in ANOTHER player's
 *   world. There is no other world here, so the value is unsatisfiable
 *   (REFUSED_MODES).
 * - start_with: the item is precollected and a junk item takes its slot; this
 *   app has no starting-inventory delivery at all, so it is refused.
 * - universal (small keys only): every key becomes one shared currency bought
 *   from a shop, which needs the retro shop stock and a universal-key item the
 *   core has no grant for; refused.
 */
import { all } from '@shared/game/data';
import type { ItemKey } from '../item-ids.data';
import type {
  DungeonItemFamily, DungeonItemMode, DungeonItemSetting,
} from './dungeon-item.type';

const DUNGEON_ITEM_FAMILIES: readonly DungeonItemFamily[] = ['bigKey', 'smallKey', 'compass', 'map'];

/** Catalog key per family: the source's own dataclass field names. */
const DUNGEON_ITEM_OPTION_KEYS: Readonly<Record<DungeonItemFamily, string>> = {
  bigKey: 'big_key_shuffle',
  smallKey: 'small_key_shuffle',
  compass: 'compass_shuffle',
  map: 'map_shuffle',
};

/** The reference default and this app's baseline: every family stays where it always was. */
const DEFAULT_DUNGEON_ITEM_SETTING: DungeonItemSetting = {
  bigKey: 'original_dungeon',
  smallKey: 'original_dungeon',
  compass: 'original_dungeon',
  map: 'original_dungeon',
};

/**
 * Values this engine will not roll, and why. Read by the option reader, which
 * falls back to the baseline instead of producing a seed that cannot be
 * played. Each one is also still locked in the catalog.
 */
const REFUSED_MODES: Readonly<Record<string, string>> = {
  different_world: 'no second world exists in a single-player seed',
  start_with: 'no starting-inventory delivery exists',
  universal: 'no shared-key currency exists in the core',
};

/** Options.py 181-183: values 0 and 1 keep the family inside the dungeons. */
const staysInDungeons = (mode: DungeonItemMode): boolean =>
  mode === 'original_dungeon' || mode === 'own_dungeons';

/** Only original_dungeon joins dungeon_specific_item_names: the own-dungeon pin. */
const staysInOwnDungeon = (mode: DungeonItemMode): boolean => mode === 'original_dungeon';

/** True while every family is where the reference baseline puts it. */
const isBaselineDungeonItems = (setting: DungeonItemSetting): boolean =>
  DUNGEON_ITEM_FAMILIES.every((family) => setting[family] === DEFAULT_DUNGEON_ITEM_SETTING[family]);

/**
 * Which family an item belongs to, read off the dungeon records: a dungeon names its own key,
 * big key, map and compass, so the four fields ARE the four families and nothing has to be
 * guessed from a name. An item no dungeon owns belongs to none.
 */
const FAMILY_BY_ITEM: ReadonlyMap<ItemKey, DungeonItemFamily> = new Map(
  all('dungeon').flatMap((dungeon) => DUNGEON_ITEM_FAMILIES.flatMap((family) => {
    const item = dungeon.items[family];
    return item === null || item === undefined ? [] : [[item, family] as [ItemKey, DungeonItemFamily]];
  })),
);

const familyOfDungeonItem = (item: ItemKey): DungeonItemFamily | undefined => FAMILY_BY_ITEM.get(item);

/** The mode governing an item; one no dungeon owns reads as the baseline. */
const modeOfDungeonItem = (setting: DungeonItemSetting, item: ItemKey): DungeonItemMode => {
  const family = familyOfDungeonItem(item);
  return family === undefined ? 'original_dungeon' : setting[family];
};

export {
  DEFAULT_DUNGEON_ITEM_SETTING, DUNGEON_ITEM_FAMILIES, DUNGEON_ITEM_OPTION_KEYS, REFUSED_MODES,
  familyOfDungeonItem, isBaselineDungeonItems, modeOfDungeonItem, staysInDungeons, staysInOwnDungeon,
};
