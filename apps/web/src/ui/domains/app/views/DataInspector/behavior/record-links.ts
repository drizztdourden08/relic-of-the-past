/* @layer renderer-app @kind logic */
import { all, get, itemGroupById, KIND_ID_PREFIXES } from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import { ENTITY_KINDS } from '../DataInspector.constants';

/** A loose named record: one name field, which a few kinds leave empty. */
interface NamedRecord {
  name?: string;
}

/** An item group has no lookup-by-id in the facade beyond `itemGroupById`; its `label` IS its name. */
const getItemGroupRecord = (id: string): NamedRecord | undefined => {
  const label = itemGroupById(id)?.label;
  return label === undefined ? undefined : { name: label };
};

/** No single-id lookup exists for enumeration entries (only by category); scan the small seeded set. */
const getEnumerationRecord = (id: string): NamedRecord | undefined => {
  const label = all('enumeration').find(entry => entry.id === id)?.label;
  return label === undefined ? undefined : { name: label };
};

/**
 * Exhaustive: every `EntityKind` resolves to a lookup that can answer "nothing".
 *
 * `get`, never a `getFoo` getter: the inspector labels whatever id a column holds, including
 * one a row names before its record exists, and a getter throws on that.
 */
const GETTERS: Record<EntityKind, (id: string) => NamedRecord | undefined> = {
  screen: (id) => get('screen', id),
  connection: (id) => get('connection', id),
  check: (id) => get('check', id),
  item: (id) => get('item', id),
  dungeon: (id) => get('dungeon', id),
  area: (id) => get('area', id),
  location: (id) => get('location', id),
  region: (id) => get('region', id),
  actor: (id) => get('actor', id),
  tag: (id) => get('tag', id),
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
  return getter(id)?.name;
};

/** The display name an id resolves to, for link text. Falls back to the id itself. */
const resolveRecordLabel = (id: string): string => defaultIdRefDisplay(id) ?? id;

export { defaultIdRefDisplay, entityKindFromId, resolveRecordLabel };
