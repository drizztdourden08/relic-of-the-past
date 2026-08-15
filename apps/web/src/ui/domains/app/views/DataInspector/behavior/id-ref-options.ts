/* @layer renderer-app @kind logic */
/**
 * The editing half of the id-reference handoff.
 *
 * `id-ref-kit` knows a field points at some collection and stops there, exactly
 * as its cell renderer does — which collections exist is not something the
 * design system may know. This is the other side: given a target kind, hand
 * back that collection's records as choosable options, so the generic editor
 * can offer a real picker without ever importing a dataset.
 *
 * Two decisions worth naming. A collection's own `id` is an id but not a
 * REFERENCE — repointing a record's primary key from a list of its siblings is
 * never the edit anyone meant — so identity paths get nothing back and the kit
 * falls back to its plain input (which `EditorRow` then forces read-only in
 * its own right, via the same `IDENTITY_PATH` this module imports rather than
 * repeats). And each list is built once and kept: the largest collection is
 * ~900 rows, the source arrays are module-level and never change, and the
 * search box would otherwise rebuild the whole list per keystroke.
 *
 * One collection is offered NARROWED rather than whole. A location record names
 * the area it sits in, and a screen carries both ids, so picking them from two
 * unrelated lists is what lets a screen claim a place on the other side of the
 * map. Once the record being edited has an area, only that area's locations are
 * offered — which is the same rule `screen-validity` refuses a saved record
 * for, applied where it costs nothing to obey.
 */
import { locationsInArea } from '@shared/game/logic/queries/area-locations';
import { COLLECTION_SOURCES } from './collection-sources';
import { resolveRecordLabel } from './record-links';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { IdRefOption } from '@ds/composites/RecordEditor';

const NONE: readonly IdRefOption[] = [];

/** The collection that narrows, and the sibling field it narrows by. */
const NARROWED_KIND: EntityKind = 'location';
const AREA_FIELD = 'areaId';

const cache = new Map<EntityKind, readonly IdRefOption[]>();

// Keyed by the filter as well as the kind, because two records open on
// different areas must not read each other's list. Derived from `cache`, so
// every entry for a kind is dropped whenever that kind's own list changes.
const narrowedCache = new Map<string, readonly IdRefOption[]>();

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

/** Everything derived from one kind's list, dropped whenever that list moves. */
const dropNarrowed = (kind: EntityKind): void => {
  for (const key of [...narrowedCache.keys()]) {
    if (key.startsWith(`${kind}|`)) narrowedCache.delete(key);
  }
};

/** The area the record being edited sits in, when it has settled on one. */
const areaIdOf = (record: unknown): string | undefined => {
  if (typeof record !== 'object' || record === null) return undefined;
  const value = (record as Record<string, unknown>)[AREA_FIELD];
  return typeof value === 'string' && value !== '' ? value : undefined;
};

const optionsInArea = (kind: EntityKind, areaId: string): readonly IdRefOption[] => {
  const key = `${kind}|${areaId}`;
  const held = narrowedCache.get(key);
  if (held) return held;
  const inside = new Set(locationsInArea(areaId).map(location => String(location.id)));
  const built = optionsFor(kind).filter(option => inside.has(option.value));
  narrowedCache.set(key, built);
  return built;
};

/**
 * What the collection behind an id-reference field holds, ready to pick from.
 * Empty for anything this screen cannot answer for, which is the kit's cue to
 * stay on its plain input.
 *
 * A record with no area yet gets the whole list rather than none of it — the
 * narrowing exists to stop a wrong pick, not to make the field unusable before
 * its sibling is filled in. An area holding nothing narrows to an empty list,
 * which drops the field back to its plain input: there is genuinely nothing to
 * choose there until a location is created in that area.
 */
const resolveIdRefOptionsFor = (
  targetKind: string,
  field: FieldDescriptor,
  record?: unknown,
): readonly IdRefOption[] => {
  if (field.path === IDENTITY_PATH) return NONE;
  const kind = asEntityKind(targetKind);
  if (!kind) return NONE;
  if (kind !== NARROWED_KIND) return optionsFor(kind);
  const areaId = areaIdOf(record);
  return areaId === undefined ? optionsFor(kind) : optionsInArea(kind, areaId);
};

/**
 * Adds one record to a collection's built list.
 *
 * Only the tag collection can grow inside a session — a term minted from the
 * editor — and the chip that was just added has to resolve to its term
 * immediately or it reads as a bare id. The list is built first if nothing has
 * asked for it yet, so the append can never be the thing that seeds a cache
 * from a half-loaded collection.
 */
const registerIdRefOption = (kind: EntityKind, option: IdRefOption): void => {
  const held = optionsFor(kind);
  if (held.some(entry => entry.value === option.value)) return;
  cache.set(kind, [...held, option]);
  dropNarrowed(kind);
};

/**
 * Drops one record from a collection's built list — the delete-guard's
 * counterpart to `registerIdRefOption`, so a deleted tag or item group stops
 * being offered as a pick the moment its own delete succeeds.
 */
const unregisterIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const next = held.filter(entry => entry.value !== id);
  if (next.length === held.length) return;
  cache.set(kind, next);
  dropNarrowed(kind);
};

/**
 * Re-resolves one record's cached label after an edit. Every reference field
 * pointing at this collection — a screen's tag chips among them — reads its
 * option list from this cache rather than the registry directly, so a rename
 * that only updated the registry would still show the OLD label here until a
 * reload; this is the fix for exactly that spot.
 */
const updateIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const label = optionLabel(id);
  cache.set(kind, held.map(entry => (entry.value === id ? { ...entry, label } : entry)));
  dropNarrowed(kind);
};

export { registerIdRefOption, resolveIdRefOptionsFor, unregisterIdRefOption, updateIdRefOption };
