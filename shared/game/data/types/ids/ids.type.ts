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
type SpriteId = `sprite-${string}`;
type ItemGroupId = `ig-${string}`;
type EnumerationId = `enum-${string}`;

export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, EnumerationId, ItemGroupId,
  ItemId, LocationId, RegionId, ScreenId, SpriteId, TagId,
};
