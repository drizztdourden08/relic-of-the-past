/* @layer renderer-app @kind logic */
import {
  all, getActor, getArea, getCheck, getConnection, getDungeon, getItem, getLocation, getScreen, getTag,
  itemGroupById, KIND_ID_PREFIXES,
} from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import { ENTITY_KINDS } from '../DataInspector.constants';

/** A named record, loosely — every kind carries some subset of these name fields. */
interface NamedRecord {
  vanillaName?: string;
  randomizerName?: string;
  name?: string;
}

/** An item group has no lookup-by-id in the facade beyond `itemGroupById`; its `label` IS its name. */
const getItemGroupRecord = (id: string): NamedRecord => ({ name: itemGroupById(id)?.label ?? id });

/** No single-id lookup exists for enumeration entries (only by category); scan the small seeded set. */
const getEnumerationRecord = (id: string): NamedRecord => ({
  name: all('enumeration').find(entry => entry.id === id)?.label ?? id,
});

/** Exhaustive — every `EntityKind` resolves to a real getter, so a link never falls back for want of one. */
const GETTERS: Record<EntityKind, (id: string) => NamedRecord> = {
  screen: getScreen,
  connection: getConnection,
  check: getCheck,
  item: getItem,
  dungeon: getDungeon,
  area: getArea,
  location: getLocation,
  actor: getActor,
  // A tag's `name` IS its term, which is the only sensible thing to call it.
  tag: getTag,
  'item-group': getItemGroupRecord,
  enumeration: getEnumerationRecord,
};

/**
 * The reverse of `KIND_ID_PREFIXES`: every id prefix this app mints, mapped
 * back to the kind it names. Built off that table rather than off `EntityKind`
 * itself, because a kind's id prefix is not always its own name — `item-group`
 * mints `ig-NNN` and `enumeration` mints `enum-NNN` — so inferring a kind from
 * an id has to go through the prefix table, not through string surgery on the
 * kind name.
 */
const PREFIX_TO_KIND: Record<string, EntityKind> = Object.fromEntries(
  ENTITY_KINDS.map(kind => [KIND_ID_PREFIXES[kind], kind]),
);

/** An id's own kind, read off its prefix (everything before the last hyphen). */
const entityKindFromId = (id: string): EntityKind | undefined => {
  const prefix = id.slice(0, id.lastIndexOf('-'));
  return PREFIX_TO_KIND[prefix];
};

const asEntityKind = (value: string | undefined): EntityKind | undefined =>
  value ? ENTITY_KINDS.find((kind) => kind === value) : undefined;

/**
 * The baseline name for an id with no column-level display choice behind it —
 * the fallback `DataTable`'s `resolveIdRefDefault` and `CompactRecordView`'s
 * `resolveIdRefDisplay` both call. `targetKindHint` wins when it names a real
 * kind (a column whose every row points at the same collection); with none —
 * `undefined`, or a hint that names nothing, which is exactly what a MIXED
 * column like the Recommendations table's `targetId` produces — this falls
 * back to reading the kind off the id's OWN prefix, so each row still
 * resolves correctly even though the column as a whole cannot say what kind
 * it holds. `undefined` here means "cannot answer", same contract as
 * `resolveIdRefDisplayValue`, which is what tells the caller to show the id.
 */
const defaultIdRefDisplay = (id: string, targetKindHint?: string): string | undefined => {
  const kind = asEntityKind(targetKindHint) ?? entityKindFromId(id);
  const getter = kind && GETTERS[kind];
  if (!getter) return undefined;
  const record = getter(id);
  return record.vanillaName ?? record.randomizerName ?? record.name;
};

/** The display name an id resolves to, for link text — falls back to the id itself. */
const resolveRecordLabel = (id: string): string => defaultIdRefDisplay(id) ?? id;

export { defaultIdRefDisplay, entityKindFromId, resolveRecordLabel };
