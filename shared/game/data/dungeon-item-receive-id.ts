/* @layer shared-game @kind logic */
/**
 * Targeted receive ids for the four dungeon-flavoured families: the TS half
 * of the contract in core/game-hooks/dungeon_item_ids.h.
 *
 * Every record of a family shares ONE native receive id (small key 36, big key
 * 50, map 51, compass 37) and the native grant credits the dungeon the player
 * is standing in, so a copy found anywhere else would land on the wrong one.
 * The target therefore travels IN the id, the only channel every delivery path
 * shares: the six override tables each store one byte per entry, and an online
 * delivery arrives as a bare id with no entry behind it at all.
 *
 *   0xC0 | (kind << 4) | palaceIndex   kind 0 small key · 1 big key · 2 map · 3 compass
 *
 *   0xC0-0xCD  small key, palace index 0-13    0xE0-0xED  map
 *   0xD0-0xDD  big key                          0xF0-0xFD  compass
 *
 * The palace index is the game's own value halved (the dataset stores
 * `palaceIndex` doubled, as the core keeps it), so the kind and the dungeon
 * both read straight off the nibbles with no table on either side.
 *
 * Pure arithmetic only, with no dataset import: the range guard is read by the
 * id modules the record facade is itself built on. Resolving a NAME to one of
 * these ids needs the records and lives in dungeon-item-target.ts.
 */

const DUNGEON_ITEM_VIRT_FIRST = 0xc0;
const DUNGEON_ITEM_VIRT_LAST = 0xfd;
/** Palace indices 0-13: the whole range the core's own halved index can name. */
const DUNGEON_ITEM_PALACE_COUNT = 14;

/** The native receive id of each kind, in the core's kind order. */
const DUNGEON_ITEM_NATIVE_IDS: readonly number[] = [36, 50, 51, 37];

const isDungeonItemReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= DUNGEON_ITEM_VIRT_FIRST && id <= DUNGEON_ITEM_VIRT_LAST
  && (id & 0x0f) < DUNGEON_ITEM_PALACE_COUNT;

/** Kind index + palace index → the targeted id, or undefined when either is out of range. */
const dungeonItemReceiveIdOf = (kind: number, palaceIndex: number): number | undefined => {
  if (kind < 0 || kind >= DUNGEON_ITEM_NATIVE_IDS.length) return undefined;
  if (palaceIndex < 0 || palaceIndex >= DUNGEON_ITEM_PALACE_COUNT) return undefined;
  return DUNGEON_ITEM_VIRT_FIRST | (kind << 4) | palaceIndex;
};

/** The kind index a targeted id belongs to; undefined for any other id. */
const dungeonItemKindOfReceiveId = (id: number): number | undefined =>
  (isDungeonItemReceiveId(id) ? (id >> 4) - (DUNGEON_ITEM_VIRT_FIRST >> 4) : undefined);

/** The native id a targeted id presents and grants as; undefined for any other id. */
const dungeonItemNativeIdOfReceiveId = (id: number): number | undefined => {
  const kind = dungeonItemKindOfReceiveId(id);
  return kind === undefined ? undefined : DUNGEON_ITEM_NATIVE_IDS[kind];
};

/** The palace index a targeted id credits; undefined for any other id. */
const dungeonItemPalaceOfReceiveId = (id: number): number | undefined =>
  (isDungeonItemReceiveId(id) ? id & 0x0f : undefined);

export {
  DUNGEON_ITEM_NATIVE_IDS,
  DUNGEON_ITEM_PALACE_COUNT,
  DUNGEON_ITEM_VIRT_FIRST,
  DUNGEON_ITEM_VIRT_LAST,
  dungeonItemKindOfReceiveId,
  dungeonItemNativeIdOfReceiveId,
  dungeonItemPalaceOfReceiveId,
  dungeonItemReceiveIdOf,
  isDungeonItemReceiveId,
};
