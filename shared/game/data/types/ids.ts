/* @layer shared-game @kind types */

type EntityKind =
  | 'screen'
  | 'connection'
  | 'check'
  | 'item'
  | 'dungeon'
  | 'area'
  | 'location'
  | 'actor';

type ScreenId = `screen-${string}`;
type ConnectionId = `connection-${string}`;
type CheckId = `check-${string}`;
type ItemId = `item-${string}`;
type DungeonId = `dungeon-${string}`;
type AreaId = `area-${string}`;
type LocationId = `location-${string}`;
type ActorId = `actor-${string}`;

/**
 * A graphics reference, NOT an entity id — it names an extracted PNG (see
 * sprite-manifest/). "sprite" means pixels and nothing else; every living or
 * interactive game entity is an `actor`.
 */
type SpriteId = `sprite-${string}`;

/** Key into taxonomy/item-groups.ts's ITEM_GROUPS — the leaf of a count Requirement. */
type ItemGroupId = string;

/**
 * Real entity counts in the game — the biggest one sets the shared zero-pad
 * width. `actor` is a provisional first-pass count (real, sourced entries mined
 * from the decompilation — see data/actors/**), not yet an exhaustive census;
 * refine when the full research pass reaches it.
 */
const ENTITY_COUNTS: Record<EntityKind, number> = {
  connection: 896,
  screen: 486,
  check: 265,
  item: 174,             // 124 vanilla + 50 randomizer-catalog additions (§7b)
  actor: 271,                // 14 npc + 9 obstacle + 33 trigger + 84 enemy + 14 boss + 117 object (Phase 8 census;
                              // +4 trigger appended for the clear-room family widening, actor-268..271)
  location: 31,
  area: 17,
  dungeon: 13,               // verified via generate-ids.ts against the real dungeon field values
};

const ID_PAD_WIDTH = Math.max(...Object.values(ENTITY_COUNTS)).toString().length;

const makeId = (kind: EntityKind, n: number): string => `${kind}-${String(n).padStart(ID_PAD_WIDTH, '0')}`;

export { ENTITY_COUNTS, ID_PAD_WIDTH, makeId };
export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, ItemGroupId,
  ItemId, LocationId, ScreenId, SpriteId,
};
