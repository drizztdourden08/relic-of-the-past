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

/**
 * What the collection behind an id-reference field holds, ready to pick from.
 * Empty for anything this screen cannot answer for, which is the kit's cue to
 * stay on its plain input.
 */
const resolveIdRefOptionsFor = (
  targetKind: string,
  field: FieldDescriptor,
): readonly IdRefOption[] => {
  if (field.path === IDENTITY_PATH) return NONE;
  const kind = asEntityKind(targetKind);
  return kind ? optionsFor(kind) : NONE;
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
};

/**
 * Drops one record from a collection's built list — the delete-guard's
 * counterpart to `registerIdRefOption`, so a deleted tag or item group stops
 * being offered as a pick the moment its own delete succeeds.
 */
const unregisterIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const next = held.filter(entry => entry.value !== id);
  if (next.length !== held.length) cache.set(kind, next);
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
};

export { registerIdRefOption, resolveIdRefOptionsFor, unregisterIdRefOption, updateIdRefOption };
