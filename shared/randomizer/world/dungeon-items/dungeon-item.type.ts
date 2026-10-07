/* @layer shared-game @kind types */
/**
 * Where a dungeon's own items may end up: the four `DungeonItem` choices of
 * Archipelago worlds/alttp/Options.py 170-213, one setting per family.
 *
 * The names are the source's own option keys, so a snapshot value maps across
 * with no translation table. Not every value is reachable here: the catalog
 * only unlocks the ones this app can both roll AND hand to the player (see
 * dungeon-item-modes.ts for what each one means and which are refused).
 */

type DungeonItemMode =
  | 'original_dungeon'
  | 'own_dungeons'
  | 'own_world'
  | 'any_world'
  | 'different_world'
  | 'start_with'
  | 'universal';

/** The four families that carry a dungeon's name, in the source's field order. */
type DungeonItemFamily = 'bigKey' | 'smallKey' | 'compass' | 'map';

type DungeonItemSetting = Readonly<Record<DungeonItemFamily, DungeonItemMode>>;

export type { DungeonItemFamily, DungeonItemMode, DungeonItemSetting };
