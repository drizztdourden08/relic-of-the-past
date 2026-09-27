/* @layer shared-game @kind barrel */
export type {
  ActorId, AreaId, CheckId, ConnectionId, DungeonId, EntityKind, EnumerationId, ItemGroupId,
  ItemId, LocationId, RegionId, ScreenId, SpriteId, TagId,
} from './ids';
export { ID_PAD_WIDTH, KIND_ID_PREFIXES, makeId } from './ids';
export type { EntityOf, EntityRecordMap } from './entity-map';
export type { ItemGroupRecord } from './item-group';
export type { ReviewMark, ReviewSource, ReviewStatus } from './review';
export type { EnumerationCategory, EnumerationEntry } from './enumeration';
export type {
  InteriorKind, ScreenGameId, ScreenKind, ScreenPosition, ScreenRecord, ScreenSpawn,
  ScreenVariantInfo, ScreenWorld, VariantCondition, World,
} from './screen';
export type {
  ConnectionForm, ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTile,
} from './connection';
export type {
  BitState, CheckGameId, CheckKind, CheckPond, CheckRecord, CheckShop, EventGroup, PondId,
  PresenceCondition, Requirement, ShopSeamKind, ShopSlotPosition,
} from './check';
export type { ItemGameId, ItemRecord } from './item';
export type { DungeonGameId, DungeonRecord } from './dungeon';
export type { AreaRecord, LocationRecord, RegionBounds, RegionRecord, RegionType } from './region';
export type { ActorCombatProfile, RangeProfile, WeaponProfile } from './combat';
export type { ActorGameId, ActorKind, ActorRecord } from './actor';
export type { TagRecord } from './tag';
export type {
  TileReq, TileLabel, TilePass, TileCat, TileAttrDef,
  TileBehavior, TileVisual,
} from './tile-attrs-types';
