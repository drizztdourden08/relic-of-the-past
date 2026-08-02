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

/** The display name an id resolves to, for link text — falls back to the id itself. */
const resolveRecordLabel = (id: string): string => {
  const kind = entityKindFromId(id);
  const getter = kind && GETTERS[kind];
  if (!getter) return id;
  const record = getter(id);
  return record.vanillaName ?? record.randomizerName ?? record.name ?? id;
};

export { entityKindFromId, resolveRecordLabel };
