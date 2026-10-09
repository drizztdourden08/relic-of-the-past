/* @layer shared-game @kind constants */
import type {
  ActorRecord, AreaRecord, CheckRecord, ConnectionRecord, DungeonRecord, EnumerationEntry, ItemGroupRecord, ItemRecord,
  LocationRecord, ScreenRecord, TagRecord,
} from '../types';

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const WIDTH = 118;
const RECORD_INDENT = 4;

const SCREEN_FIELDS = [
  'id', 'gameId', 'kind', 'world', 'interiorKind', 'name',
  'areaId', 'locationId', 'regionId', 'bounds', 'position', 'tags', 'variant', 'nav',
  'triggerIds', 'spawns', 'review',
] as const satisfies readonly (keyof ScreenRecord)[];

const CONNECTION_FIELDS = [
  'id', 'screenId', 'toConnectionId', 'kind', 'placement', 'canExit',
  'gameId', 'dungeonId', 'gatedBy', 'requirements', 'name', 'tags', 'nav', 'review',
] as const satisfies readonly (keyof ConnectionRecord)[];

const AREA_FIELDS = ['id', 'world', 'name', 'review'] as const satisfies readonly (keyof AreaRecord)[];

const LOCATION_FIELDS = ['id', 'areaId', 'name', 'review'] as const satisfies readonly (keyof LocationRecord)[];

const CHECK_FIELDS = [
  'id', 'gameId', 'kind', 'screenId', 'regionId', 'dungeonId', 'subArea', 'name',
  'vanillaItemIds', 'scope', 'price', 'shop', 'pond',
  'isGuaranteedReward', 'tags', 'actorId', 'requirements', 'presence', 'visualNote', 'sourceFunc',
  'eventGroup', 'derived', 'derivedDungeon', 'fallback', 'reachAny', 'now', 'statusOnly', 'review',
] as const satisfies readonly (keyof CheckRecord)[];

const ITEM_FIELDS = [
  'id', 'gameId', 'origin', 'category', 'name', 'dungeonId', 'tier', 'poolClass',
  'spendsMeter', 'weapon', 'aliasOf', 'sharesSlotWith', 'usualChestId', 'spriteId', 'review',
] as const satisfies readonly (keyof ItemRecord)[];

const DUNGEON_FIELDS = [
  'id', 'gameId', 'name', 'fileStem', 'items', 'bossCheckId', 'prizeCheckId', 'bossActorId',
  'medallionGate', 'roomScreenIds', 'regionIds', 'review',
] as const satisfies readonly (keyof DungeonRecord)[];

const ACTOR_FIELDS = [
  'id', 'gameId', 'kind', 'name', 'effect', 'clearedBy', 'combat', 'review',
] as const satisfies readonly (keyof ActorRecord)[];

const TAG_FIELDS = [
  'id', 'name', 'namespace', 'value', 'label', 'namespaceLabel', 'appliesTo', 'review',
] as const satisfies readonly (keyof TagRecord)[];

const ITEM_GROUP_FIELDS = ['id', 'label', 'memberIds', 'review'] as const satisfies readonly (keyof ItemGroupRecord)[];

const ENUMERATION_FIELDS = [
  'id', 'category', 'value', 'label', 'appliesTo', 'review',
] as const satisfies readonly (keyof EnumerationEntry)[];

export {
  ACTOR_FIELDS, AREA_FIELDS, CHECK_FIELDS, CONNECTION_FIELDS, DUNGEON_FIELDS, ENUMERATION_FIELDS, IDENT, ITEM_FIELDS,
  ITEM_GROUP_FIELDS, LOCATION_FIELDS, RECORD_INDENT, SCREEN_FIELDS, TAG_FIELDS, WIDTH,
};
