/**
 * @layer tooling-scripts
 * @kind constants
 *
 * Emitted field order (follows each record interface's own declaration order, so
 * a data file reads the way its type does) plus the fields that must be present.
 * The emitter throws on any record field NOT listed here, so a seed field can
 * never be silently dropped.
 */
const SCREEN_FIELDS = [
  'id', 'gameId', 'kind', 'world', 'interiorKind', 'vanillaName', 'randomizerName',
  'areaId', 'locationId', 'position', 'tags', 'variant', 'status', 'nav',
  'triggerIds', 'spawns',
] as const;

const CONNECTION_FIELDS = [
  'id', 'gameId', 'kind', 'fromScreenId', 'toScreenId', 'placement', 'direction',
  'counterpartId', 'dungeonId', 'gatedBy', 'requirements', 'name', 'tags', 'nav',
] as const;

const CHECK_FIELDS = [
  'id', 'gameId', 'kind', 'screenId', 'dungeonId', 'vanillaName', 'randomizerName',
  'vanillaItemIds', 'actorId', 'requirements', 'presence', 'visualNote', 'sourceFunc',
] as const;

const ITEM_FIELDS = [
  'id', 'gameId', 'origin', 'category', 'vanillaName', 'randomizerName', 'dungeonId',
  'tier', 'weapon', 'aliasOf', 'spriteId',
] as const;

const DUNGEON_FIELDS = [
  'id', 'gameId', 'vanillaName', 'randomizerName', 'bossCheckId', 'prizeCheckId',
  'medallionGate', 'roomScreenIds',
] as const;

const AREA_FIELDS = ['id', 'world', 'vanillaName', 'randomizerName'] as const;
const LOCATION_FIELDS = ['id', 'areaId', 'vanillaName', 'randomizerName'] as const;

const ACTOR_FIELDS = [
  'id', 'gameId', 'kind', 'vanillaName', 'randomizerName', 'effect', 'clearedBy', 'combat',
] as const;

const REQUIRED = {
  screen: ['id', 'gameId', 'kind', 'world', 'randomizerName', 'areaId', 'locationId', 'tags', 'status'],
  connection: ['id', 'kind', 'fromScreenId', 'toScreenId', 'direction', 'tags'],
  check: ['id', 'gameId', 'kind', 'randomizerName', 'vanillaItemIds'],
  item: ['id', 'origin', 'category', 'randomizerName'],
  dungeon: ['id', 'gameId', 'randomizerName', 'roomScreenIds'],
  area: ['id', 'world', 'randomizerName'],
  location: ['id', 'areaId', 'randomizerName'],
  actor: ['id', 'gameId', 'kind'],
} as const;

/** Expected record counts — the parity gate. */
const EXPECTED_COUNTS = {
  screen: 486,
  connection: 896,
  check: 265,
  item: 124,
  dungeon: 13,
  area: 17,
  location: 31,
  actor: 52,
} as const;

export {
  ACTOR_FIELDS, AREA_FIELDS, CHECK_FIELDS, CONNECTION_FIELDS, DUNGEON_FIELDS,
  EXPECTED_COUNTS, ITEM_FIELDS, LOCATION_FIELDS, REQUIRED, SCREEN_FIELDS,
};
