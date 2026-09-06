/* @layer shared-game @kind data */
/**
 * The filenames record files are kept under, keyed by frozen id.
 *
 * These name files in this tree, so they all belong with it, including the
 * ones whose values do not read as place names. The resolvers that choose
 * between them stay in the public repository: the rule for picking a destination
 * is ours, the layout being picked from is not.
 *
 * Keyed on frozen ids for the reason record-file-targets.ts explains: no display
 * name and no slugified string ever picks a path, so renaming a record can never
 * move (or split) the file its records live in.
 */
import type { ActorKind, InteriorKind } from '@shared/game/data/types';
import type { ItemCategory } from '@shared/game/data/taxonomy/item-categories';

/** The overworld file each area's records live in. */
const AREA_FILE_STEMS: Readonly<Record<string, string>> = {
  'area-001': 'central-hyrule',
  'area-002': 'dark-death-mountain',
  'area-003': 'dark-east',
  'area-004': 'dark-lake-hylia',
  'area-005': 'dark-mire',
  'area-006': 'dark-north',
  'area-007': 'dark-south',
  'area-008': 'death-mountain',
  'area-009': 'desert',
  'area-010': 'east-hyrule',
  'area-011': 'hyrule-castle',
  'area-012': 'kakariko',
  'area-013': 'lake-hylia',
  'area-014': 'lost-woods',
  'area-015': 'skull-woods-area',
  'area-016': 'south-hyrule',
  'area-017': 'village-of-outcasts',
};

/** The file each kind of interior screen is filed in. */
const INTERIOR_FILE_STEMS: Readonly<Record<InteriorKind, string>> = {
  house: 'houses', cave: 'caves', shop: 'shops', fairy: 'fairy', well: 'wells',
  passage: 'passages', hint: 'hints', gamble: 'gamble', special: 'special',
};

/**
 * The check file each area's records live in. Kept separate from
 * `AREA_FILE_STEMS` because the two trees do not line up: checks are filed under
 * `checks/<world>-world/` with no per-size split, and two areas carry no check
 * file at all. An area absent here resolves to "no destination" instead of to a
 * path that does not exist.
 */
const AREA_CHECK_FILES: Readonly<Record<string, string>> = {
  'area-001': 'light-world/central-hyrule',
  'area-008': 'light-world/death-mountain',
  'area-009': 'light-world/desert',
  'area-010': 'light-world/east-hyrule',
  'area-011': 'light-world/hyrule-castle',
  'area-012': 'light-world/kakariko',
  'area-013': 'light-world/lake-hylia',
  'area-014': 'light-world/lost-woods',
  'area-016': 'light-world/south-hyrule',
  'area-002': 'dark-world/dark-death-mountain',
  'area-003': 'dark-world/dark-east',
  'area-005': 'dark-world/dark-mire',
  'area-006': 'dark-world/dark-north',
  'area-007': 'dark-world/dark-south',
  'area-017': 'dark-world/village-of-outcasts',
};

/**
 * One dungeon's checks outgrew a single file and were split by size. A NEW
 * record goes in the last split; an existing one is edited where it already
 * sits, which the writer locates by id and not by this table.
 */
const SPLIT_DUNGEON_CHECK_FILES: Readonly<Record<string, string>> = {
  'ganons-tower': 'ganons-tower-2',
};

/**
 * ONE canonical destination per category for a BRAND-NEW item.
 *
 * This is a simplification, not a recovered historical rule. The committed
 * split has no category→file rule to recover (weapons sit in both weapons.ts and
 * randomizer.ts, junk spans four files, keys three), so continuing it faithfully
 * would mean inventing a size-balancing heuristic for a collection that grows a
 * record very rarely. Existing records are not moved. The writer edits and
 * removes them where they already sit, located by id.
 */
const ITEM_CATEGORY_FILES: Readonly<Record<ItemCategory, string>> = {
  weapon: 'weapons',
  equipment: 'equipment-2',
  bottle: 'equipment-2',
  upgrade: 'equipment-2',
  junk: 'junk-2',
  key: 'dungeon-items-3',
  crystal: 'progression',
  event: 'progression',
  medallion: 'progression',
};

/**
 * The same bargain for actors, whose committed split IS by kind and then by size
 * within a kind: a new record goes to the last file of its kind's group.
 */
const ACTOR_KIND_FILES: Readonly<Record<ActorKind, string>> = {
  enemy: 'enemies-4',
  object: 'objects-4',
  trigger: 'triggers-2',
  boss: 'bosses',
  npc: 'npcs',
  obstacle: 'obstacles',
};

export {
  ACTOR_KIND_FILES, AREA_CHECK_FILES, AREA_FILE_STEMS, INTERIOR_FILE_STEMS,
  ITEM_CATEGORY_FILES, SPLIT_DUNGEON_CHECK_FILES,
};
