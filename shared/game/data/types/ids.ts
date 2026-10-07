/* @layer shared-game @kind types */

type EntityKind =
  | 'screen'
  | 'connection'
  | 'check'
  | 'item'
  | 'dungeon'
  | 'area'
  | 'location'
  | 'actor'
  | 'tag'
  | 'item-group'
  | 'enumeration';

type ScreenId = `screen-${string}`;
type ConnectionId = `connection-${string}`;
type CheckId = `check-${string}`;
type ItemId = `item-${string}`;
type DungeonId = `dungeon-${string}`;
type AreaId = `area-${string}`;
type LocationId = `location-${string}`;
type ActorId = `actor-${string}`;
type TagId = `tag-${string}`;

/** A graphics reference, NOT an entity id: it names an extracted PNG (see
 *  sprite-manifest/). "sprite" means pixels; every game entity is an `actor`. */
type SpriteId = `sprite-${string}`;

/** A named item-group record's id (data/item-groups/). Used as the leaf of a count Requirement. */
type ItemGroupId = `ig-${string}`;

/** An enumeration entry's id (data/enumeration/). */
type EnumerationId = `enum-${string}`;

/** Real entity counts in the game; the biggest one sets the shared zero-pad
 *  width. `actor` is a provisional count (see data/actors/**), not a full census. */
const ENTITY_COUNTS: Record<EntityKind, number> = {
  // STALE ON PURPOSE: the real count is ~1610 since the connection-points
  // migration. Bumping it would push `ID_PAD_WIDTH` from 3 digits to 4 and
  // re-pad every OTHER kind's future ids. `makeId` handles the longer ids
  // (`padStart` never truncates).
  connection: 896,
  screen: 486,
  check: 265,
  item: 174,             // 124 vanilla + 50 randomizer-catalog additions (§7b)
  actor: 271,                // 14 npc + 9 obstacle + 33 trigger + 84 enemy + 14 boss + 117 object (Phase 8 census;
                              // +4 trigger appended for the clear-room family widening, actor-268..271)
  tag: 84,                   // 40 screen terms + 40 crossing terms + 4 check content terms, derived from the taxonomy tables
                              // (the dir:one-way/dir:two-way pair was retired, since direction comes from `canExit`)
  location: 31,
  area: 17,
  dungeon: 13,               // verified via generate-ids.ts against the real dungeon field values
  'item-group': 7,           // Swords, Bottles, Crystals, Pendants, Medallions, Bows, Gloves
  enumeration: 60,           // one row per value across the 10 closed-set label categories
                              // (screen-status was retired with ScreenRecord.status; enum-063 'drop' was added to connection-kind)
};

const ID_PAD_WIDTH = Math.max(...Object.values(ENTITY_COUNTS)).toString().length;

/**
 * The id prefix each kind mints under: the kind name, except `item-group`
 * (`ig-NNN`) and `enumeration` (`enum-NNN`). Read this instead of assuming `${kind}-`.
 */
const KIND_ID_PREFIXES: Record<EntityKind, string> = {
  screen: 'screen',
  connection: 'connection',
  check: 'check',
  item: 'item',
  dungeon: 'dungeon',
  area: 'area',
  location: 'location',
  actor: 'actor',
  tag: 'tag',
  'item-group': 'ig',
  enumeration: 'enum',
};

const makeId = (kind: EntityKind, n: number): string => `${KIND_ID_PREFIXES[kind]}-${String(n).padStart(ID_PAD_WIDTH, '0')}`;

export { ENTITY_COUNTS, ID_PAD_WIDTH, KIND_ID_PREFIXES, makeId };
export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, EnumerationId, ItemGroupId,
  ItemId, LocationId, ScreenId, SpriteId, TagId,
};
