/* @layer shared-game @kind logic */
/**
 * Record → TypeScript source text, for the dev editor's write path.
 *
 * The input is a real `ScreenRecord` / `ConnectionRecord`, so an emitted literal
 * cannot carry a stale shape. The field-order tuples below are checked against
 * `keyof` at compile time: a record kind that gains a field is a BUILD ERROR
 * here until the order lists it, and any key the order does not know throws
 * instead of being silently dropped.
 *
 * Output style matches the committed data files, with one field per line and
 * nested values collapsed onto one line while they fit.
 */
import type {
  ActorRecord, AreaRecord, CheckRecord, ConnectionRecord, DungeonRecord, EnumerationEntry, ItemGroupRecord, ItemRecord,
  LocationRecord, ScreenRecord, TagRecord,
} from './types';

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
/** Wrap width the committed data files were emitted at. */
const WIDTH = 118;

const quote = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const propKey = (k: string): string => (IDENT.test(k) ? k : quote(k));

const defined = (v: Record<string, unknown>): [string, unknown][] =>
  Object.entries(v).filter(([, val]) => val !== undefined);

const inline = (v: unknown): string => {
  if (v === null) return 'null';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.length ? `[${v.map(inline).join(', ')}]` : '[]';
  if (typeof v === 'object') {
    const parts = defined(v as Record<string, unknown>).map(([k, val]) => `${propKey(k)}: ${inline(val)}`);
    return parts.length ? `{ ${parts.join(', ')} }` : '{}';
  }
  throw new Error(`cannot serialize ${typeof v}`);
};

/**
 * `column` is where the value starts (it decides whether the value still fits on
 * one line); `indent` is the indentation of the LINE the value sits on, which is
 * what continuation lines align to.
 */
const pretty = (v: unknown, column: number, indent: number): string => {
  const flat = inline(v);
  if (column + flat.length <= WIDTH) return flat;
  const pad = ' '.repeat(indent);
  const padIn = ' '.repeat(indent + 2);
  if (Array.isArray(v) && v.length) {
    return `[\n${v.map(x => `${padIn}${pretty(x, indent + 2, indent + 2)},`).join('\n')}\n${pad}]`;
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const rows = defined(v as Record<string, unknown>);
    if (rows.length) {
      const body = rows.map(([k, val]) => {
        const at = indent + 2 + propKey(k).length + 2;
        return `${padIn}${propKey(k)}: ${pretty(val, at, indent + 2)},`;
      });
      return `{\n${body.join('\n')}\n${pad}}`;
    }
  }
  return flat;
};

interface FieldSpec<T> {
  /** Emission order, which follows the interface's own declaration order. */
  order: readonly (keyof T & string)[];
  /** Every field the shape declares, for the stray-key gate. */
  known: Record<keyof T, true>;
}

const literal = <T,>(record: T, spec: FieldSpec<T>): string => {
  const row = record as Record<string, unknown>;
  const stray = Object.keys(row).filter(k => row[k] !== undefined && !(k in spec.known));
  if (stray.length) throw new Error(`record has field(s) the emitter does not know: ${stray.join(', ')}`);
  const rows = spec.order
    .filter(k => row[k] !== undefined)
    .map(k => `    ${propKey(k)}: ${pretty(row[k], 4 + propKey(k).length + 2, 4)},`);
  return `  {\n${rows.join('\n')}\n  },`;
};

const SCREEN_FIELDS = [
  'id', 'gameId', 'kind', 'world', 'interiorKind', 'vanillaName', 'randomizerName',
  'areaId', 'locationId', 'position', 'tags', 'variant', 'nav',
  'triggerIds', 'spawns',
] as const satisfies readonly (keyof ScreenRecord)[];

const CONNECTION_FIELDS = [
  'id', 'screenId', 'toConnectionId', 'kind', 'placement', 'canExit',
  'gameId', 'dungeonId', 'gatedBy', 'requirements', 'name', 'tags', 'nav',
] as const satisfies readonly (keyof ConnectionRecord)[];

// Completeness gates. `Record<keyof X, true>` demands every declared field, so a
// field added to a record shape fails to compile here until it is emitted.
const SCREEN_SPEC: FieldSpec<ScreenRecord> = {
  order: SCREEN_FIELDS,
  known: Object.fromEntries(SCREEN_FIELDS.map(f => [f, true])) as Record<(typeof SCREEN_FIELDS)[number], true>,
};

const CONNECTION_SPEC: FieldSpec<ConnectionRecord> = {
  order: CONNECTION_FIELDS,
  known: Object.fromEntries(CONNECTION_FIELDS.map(f => [f, true])) as Record<(typeof CONNECTION_FIELDS)[number], true>,
};

const AREA_FIELDS = ['id', 'world', 'vanillaName', 'randomizerName'] as const satisfies readonly (keyof AreaRecord)[];

const LOCATION_FIELDS = ['id', 'areaId', 'vanillaName', 'randomizerName'] as const satisfies readonly (keyof LocationRecord)[];

const AREA_SPEC: FieldSpec<AreaRecord> = {
  order: AREA_FIELDS,
  known: Object.fromEntries(AREA_FIELDS.map(f => [f, true])) as Record<(typeof AREA_FIELDS)[number], true>,
};

const LOCATION_SPEC: FieldSpec<LocationRecord> = {
  order: LOCATION_FIELDS,
  known: Object.fromEntries(LOCATION_FIELDS.map(f => [f, true])) as Record<(typeof LOCATION_FIELDS)[number], true>,
};

const CHECK_FIELDS = [
  'id', 'gameId', 'kind', 'screenId', 'dungeonId', 'vanillaName', 'randomizerName',
  'vanillaItemIds', 'tags', 'actorId', 'requirements', 'presence', 'visualNote', 'sourceFunc',
] as const satisfies readonly (keyof CheckRecord)[];

const ITEM_FIELDS = [
  'id', 'gameId', 'origin', 'category', 'vanillaName', 'randomizerName', 'dungeonId', 'tier', 'weapon', 'aliasOf',
  'spriteId',
] as const satisfies readonly (keyof ItemRecord)[];

const DUNGEON_FIELDS = [
  'id', 'gameId', 'vanillaName', 'randomizerName', 'fileStem', 'bossCheckId', 'prizeCheckId', 'medallionGate',
  'roomScreenIds',
] as const satisfies readonly (keyof DungeonRecord)[];

const ACTOR_FIELDS = [
  'id', 'gameId', 'kind', 'vanillaName', 'randomizerName', 'effect', 'clearedBy', 'combat',
] as const satisfies readonly (keyof ActorRecord)[];

const TAG_FIELDS = [
  'id', 'name', 'namespace', 'value', 'label', 'namespaceLabel', 'appliesTo',
] as const satisfies readonly (keyof TagRecord)[];

const TAG_SPEC: FieldSpec<TagRecord> = {
  order: TAG_FIELDS,
  known: Object.fromEntries(TAG_FIELDS.map(f => [f, true])) as Record<(typeof TAG_FIELDS)[number], true>,
};

const ITEM_GROUP_FIELDS = ['id', 'label', 'memberIds'] as const satisfies readonly (keyof ItemGroupRecord)[];

const ITEM_GROUP_SPEC: FieldSpec<ItemGroupRecord> = {
  order: ITEM_GROUP_FIELDS,
  known: Object.fromEntries(ITEM_GROUP_FIELDS.map(f => [f, true])) as Record<(typeof ITEM_GROUP_FIELDS)[number], true>,
};

const ENUMERATION_FIELDS = [
  'id', 'category', 'value', 'label', 'appliesTo',
] as const satisfies readonly (keyof EnumerationEntry)[];

const ENUMERATION_SPEC: FieldSpec<EnumerationEntry> = {
  order: ENUMERATION_FIELDS,
  known: Object.fromEntries(ENUMERATION_FIELDS.map(f => [f, true])) as Record<(typeof ENUMERATION_FIELDS)[number], true>,
};

const CHECK_SPEC: FieldSpec<CheckRecord> = {
  order: CHECK_FIELDS,
  known: Object.fromEntries(CHECK_FIELDS.map(f => [f, true])) as Record<(typeof CHECK_FIELDS)[number], true>,
};

const ITEM_SPEC: FieldSpec<ItemRecord> = {
  order: ITEM_FIELDS,
  known: Object.fromEntries(ITEM_FIELDS.map(f => [f, true])) as Record<(typeof ITEM_FIELDS)[number], true>,
};

const DUNGEON_SPEC: FieldSpec<DungeonRecord> = {
  order: DUNGEON_FIELDS,
  known: Object.fromEntries(DUNGEON_FIELDS.map(f => [f, true])) as Record<(typeof DUNGEON_FIELDS)[number], true>,
};

const ACTOR_SPEC: FieldSpec<ActorRecord> = {
  order: ACTOR_FIELDS,
  known: Object.fromEntries(ACTOR_FIELDS.map(f => [f, true])) as Record<(typeof ACTOR_FIELDS)[number], true>,
};

/** A record whose frozen id has not been allocated yet. The allocator adds it. */
type Unnumbered<T extends { id: unknown }> = Omit<T, 'id'>;

type PendingScreenRecord = Unnumbered<ScreenRecord>;
type PendingConnectionRecord = Unnumbered<ConnectionRecord>;
/** A tag or item group being replaced in place. The delete-guard's write path
 *  never mints a new id for either, so only the "id already known" shape is needed. */
type PendingTagRecord = Unnumbered<TagRecord>;
type PendingItemGroupRecord = Unnumbered<ItemGroupRecord>;
/** An enumeration entry being created or replaced in place, under the same "id comes from
 *  the allocator, never from the caller" bargain as a tag or an item group. */
type PendingEnumerationRecord = Unnumbered<EnumerationEntry>;

const serializeScreenRecord = (record: ScreenRecord | PendingScreenRecord): string =>
  literal(record as ScreenRecord, SCREEN_SPEC);

const serializeConnectionRecord = (record: ConnectionRecord | PendingConnectionRecord): string =>
  literal(record as ConnectionRecord, CONNECTION_SPEC);

const serializeAreaRecord = (record: AreaRecord): string => literal(record, AREA_SPEC);

const serializeLocationRecord = (record: LocationRecord): string => literal(record, LOCATION_SPEC);

const serializeCheckRecord = (record: CheckRecord): string => literal(record, CHECK_SPEC);

const serializeItemRecord = (record: ItemRecord): string => literal(record, ITEM_SPEC);

const serializeDungeonRecord = (record: DungeonRecord): string => literal(record, DUNGEON_SPEC);

const serializeActorRecord = (record: ActorRecord): string => literal(record, ACTOR_SPEC);

const serializeTagRecord = (record: TagRecord): string => literal(record, TAG_SPEC);

const serializeItemGroupRecord = (record: ItemGroupRecord): string => literal(record, ITEM_GROUP_SPEC);

const serializeEnumerationRecord = (record: EnumerationEntry): string => literal(record, ENUMERATION_SPEC);

export {
  serializeActorRecord, serializeAreaRecord, serializeCheckRecord, serializeConnectionRecord,
  serializeDungeonRecord, serializeEnumerationRecord, serializeItemGroupRecord, serializeItemRecord,
  serializeLocationRecord, serializeScreenRecord, serializeTagRecord,
};
export type {
  PendingConnectionRecord, PendingEnumerationRecord, PendingItemGroupRecord, PendingScreenRecord, PendingTagRecord,
  Unnumbered,
};
