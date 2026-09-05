/* @layer renderer-app @kind logic */
/**
 * The editing half of the id-reference handoff: given a target kind, hand back
 * that collection's records as options, so the generic editor can offer a
 * picker without importing a dataset. A record's own `id` is not a reference,
 * so identity paths get nothing and the kit stays on its plain input
 * (`EditorRow` forces it read-only via the same `IDENTITY_PATH`). Lists are
 * built once and kept: the source arrays never change, and the search box
 * would otherwise rebuild ~900 rows per keystroke.
 */
import { COLLECTION_SOURCES } from './collection-sources';
import { resolveRecordLabel } from './record-links';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { IdRefOption } from '@ds/composites/RecordEditor';

const NONE: readonly IdRefOption[] = [];

const cache = new Map<EntityKind, readonly IdRefOption[]>();

const asEntityKind = (value: string): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

const optionLabel = (id: string): string => {
  const name = resolveRecordLabel(id);
  return name === id ? id : name;
};

const buildOptions = (kind: EntityKind): readonly IdRefOption[] => {
  const source = COLLECTION_SOURCES[kind];
  return source.rows.map(row => {
    const id = source.getId(row);
    return { value: id, label: optionLabel(id), description: id };
  });
};

const optionsFor = (kind: EntityKind): readonly IdRefOption[] => {
  const held = cache.get(kind);
  if (held) return held;
  const built = buildOptions(kind);
  cache.set(kind, built);
  return built;
};

/** Options for an id-reference field. Empty when unanswerable, which keeps the kit on its plain input. */
const resolveIdRefOptionsFor = (
  targetKind: string,
  field: FieldDescriptor,
): readonly IdRefOption[] => {
  if (field.path === IDENTITY_PATH) return NONE;
  const kind = asEntityKind(targetKind);
  return kind ? optionsFor(kind) : NONE;
};

/**
 * Adds one record to a collection's built list so a freshly minted chip does
 * not read as a bare id. The list is built first if nothing has asked for it
 * yet, so the append never seeds a cache from a half-loaded collection.
 */
const registerIdRefOption = (kind: EntityKind, option: IdRefOption): void => {
  const held = optionsFor(kind);
  if (held.some(entry => entry.value === option.value)) return;
  cache.set(kind, [...held, option]);
};

/** Drops one record from a collection's built list once its delete succeeds. */
const unregisterIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const next = held.filter(entry => entry.value !== id);
  if (next.length !== held.length) cache.set(kind, next);
};

/** Re-resolves one record's cached label after an edit. Reference fields read
 *  this cache, not the registry, so a rename would otherwise show the old label. */
const updateIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const label = optionLabel(id);
  cache.set(kind, held.map(entry => (entry.value === id ? { ...entry, label } : entry)));
};

export { registerIdRefOption, resolveIdRefOptionsFor, unregisterIdRefOption, updateIdRefOption };
