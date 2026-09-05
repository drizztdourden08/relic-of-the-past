/* @layer renderer-app @kind logic */
import {
  all, getActor, getArea, getCheck, getConnection, getDungeon, getItem, getLocation, getScreen, getTag,
  itemGroupById, KIND_ID_PREFIXES,
} from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import { ENTITY_KINDS } from '../DataInspector.constants';

/** A loose named record. Every kind carries some subset of these name fields. */
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

/** Exhaustive: every `EntityKind` resolves to a real getter. */
const GETTERS: Record<EntityKind, (id: string) => NamedRecord> = {
  screen: getScreen,
  connection: getConnection,
  check: getCheck,
  item: getItem,
  dungeon: getDungeon,
  area: getArea,
  location: getLocation,
  actor: getActor,
  tag: getTag,
  'item-group': getItemGroupRecord,
  enumeration: getEnumerationRecord,
};

/** The reverse of `KIND_ID_PREFIXES`. A kind's prefix is not always its name
 *  (`item-group` mints `ig-NNN`, `enumeration` mints `enum-NNN`). */
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
 * The baseline name for an id with no column-level display choice. A valid
 * `targetKindHint` wins; otherwise the kind is read off the id's own prefix,
 * so a mixed column (the Recommendations table's `targetId`) still resolves
 * per row. `undefined` means "cannot answer" and the caller shows the id.
 */
const defaultIdRefDisplay = (id: string, targetKindHint?: string): string | undefined => {
  const kind = asEntityKind(targetKindHint) ?? entityKindFromId(id);
  const getter = kind && GETTERS[kind];
  if (!getter) return undefined;
  const record = getter(id);
  return record.vanillaName ?? record.randomizerName ?? record.name;
};

/** The display name an id resolves to, for link text. Falls back to the id itself. */
const resolveRecordLabel = (id: string): string => defaultIdRefDisplay(id) ?? id;

export { defaultIdRefDisplay, entityKindFromId, resolveRecordLabel };
