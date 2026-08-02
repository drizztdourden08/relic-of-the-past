/* @layer shared-game @kind barrel */
export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, EnumerationId, ItemGroupId,
  ItemId, LocationId, ScreenId, SpriteId, TagId,
} from './ids';
export { ENTITY_COUNTS, ID_PAD_WIDTH, KIND_ID_PREFIXES, makeId } from './ids';
export type { EntityOf, EntityRecordMap } from './entity-map';
export type { ItemGroupRecord } from './item-group';
export type { EnumerationCategory, EnumerationEntry } from './enumeration';
export type {
  InteriorKind, ScreenGameId, ScreenKind, ScreenPosition, ScreenRecord, ScreenSpawn,
  ScreenStatus, ScreenVariantInfo, ScreenWorld, VariantCondition, World,
} from './screen';
export type {
  ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTileRange,
} from './connection';
export type { BitState, CheckGameId, CheckKind, CheckRecord, PresenceCondition, Requirement } from './check';
export type { ItemGameId, ItemRecord } from './item';
export type { DungeonGameId, DungeonRecord } from './dungeon';
export type { AreaRecord, LocationRecord } from './region';
export type { ActorCombatProfile, RangeProfile, WeaponProfile } from './combat';
export type { ActorGameId, ActorKind, ActorRecord } from './actor';
export type { TagRecord } from './tag';
