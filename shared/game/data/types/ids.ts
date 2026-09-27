/* @layer shared-game @kind types */

type EntityKind =
  | 'screen'
  | 'connection'
  | 'check'
  | 'item'
  | 'dungeon'
  | 'area'
  | 'location'
  | 'region'
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
type RegionId = `region-${string}`;
type ActorId = `actor-${string}`;
type TagId = `tag-${string}`;

/** A graphics reference, NOT an entity id: it names an extracted PNG (see
 *  sprite-manifest/). "sprite" means pixels; every game entity is an `actor`. */
type SpriteId = `sprite-${string}`;

/** A named item-group record's id (data/item-groups/). Used as the leaf of a count Requirement. */
type ItemGroupId = `ig-${string}`;

/** An enumeration entry's id (data/enumeration/). */
type EnumerationId = `enum-${string}`;

/**
 * How many digits every minted id is padded to.
 *
 * Three, and it stays three: every id in the dataset is already written this way, and a fourth
 * digit would re-pad every kind's future ids into a second spelling of the same number. The
 * connection collection passed 999 records with the connection-points migration, so `makeId`
 * lets a longer number through unpadded (`padStart` never truncates) instead of widening this.
 *
 * It used to be derived from a hand-kept table of per-kind counts, three of whose eleven rows
 * had drifted from the records they claimed to count. A count is a query over the records now:
 * `find(kind, () => true).length`.
 */
const ID_PAD_WIDTH = 3;

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
  region: 'region',
  actor: 'actor',
  tag: 'tag',
  'item-group': 'ig',
  enumeration: 'enum',
};

const makeId = (kind: EntityKind, n: number): string => `${KIND_ID_PREFIXES[kind]}-${String(n).padStart(ID_PAD_WIDTH, '0')}`;

export { ID_PAD_WIDTH, KIND_ID_PREFIXES, makeId };
export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, EnumerationId, ItemGroupId,
  ItemId, LocationId, RegionId, ScreenId, SpriteId, TagId,
};
