/* @layer renderer-app @kind logic */
/**
 * The reading half of the id-reference handoff, and the sibling of
 * `id-ref-options`.
 *
 * A table column can be told to show a field of the record it POINTS AT instead
 * of the id — "Area" reading as a name rather than `area-008`. The table can
 * ask for that and can remember the choice, but it cannot answer either half of
 * it: which fields the other collection has, and what one of its records holds.
 * Both are dataset facts, so both live here and are injected, which is the same
 * bargain the editor's option lookup strikes next door.
 *
 * Two things are kept rather than recomputed. The offerable field list is
 * derived from a collection's rows, and the rows are module-level and never
 * change, so it is built once per collection. The by-id index is the same
 * story, and it matters more: without it every cell in a nine-hundred-row table
 * would scan the whole target collection on every render.
 */
import { buildSchema, getPath } from '@ds/data';
import { COLLECTION_SOURCES } from './collection-sources';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import type { IdRefTargetField } from '@ds/composites/DataTable';
import type { InspectorRow } from '../DataInspector.type';

/** Container kinds address nothing on their own — only their leaves do. */
const CONTAINER_KINDS: readonly FieldDescriptor['kind'][] = ['object', 'union', 'array'];

const NO_FIELDS: readonly IdRefTargetField[] = [];

const fieldCache = new Map<EntityKind, readonly IdRefTargetField[]>();

const rowCache = new Map<EntityKind, ReadonlyMap<string, InspectorRow>>();

const asEntityKind = (value: string): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

/**
 * Every leaf of the collection's schema, nested ones included: a screen's
 * `gameId.roomIndex` is as legitimate a thing to show as its name, and the
 * paths are already dotted, so the same read works at any depth.
 */
const collectLeaves = (
  fields: readonly FieldDescriptor[],
  into: IdRefTargetField[],
): IdRefTargetField[] => {
  for (const field of fields) {
    if (field.children) collectLeaves(field.children, into);
    else if (!CONTAINER_KINDS.includes(field.kind)) into.push({ path: field.path, label: field.label });
  }
  return into;
};

const fieldsFor = (kind: EntityKind): readonly IdRefTargetField[] => {
  const held = fieldCache.get(kind);
  if (held) return held;
  const source = COLLECTION_SOURCES[kind];
  const built = collectLeaves(buildSchema(source.rows, source.config), []);
  fieldCache.set(kind, built);
  return built;
};

const rowsFor = (kind: EntityKind): ReadonlyMap<string, InspectorRow> => {
  const held = rowCache.get(kind);
  if (held) return held;
  const source = COLLECTION_SOURCES[kind];
  const built = new Map(source.rows.map(row => [source.getId(row), row]));
  rowCache.set(kind, built);
  return built;
};

const asDisplayText = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value || undefined;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
};

/** Which fields of the collection behind a reference can stand in for its id. */
const resolveIdRefTargetFields = (targetKind: string): readonly IdRefTargetField[] => {
  const kind = asEntityKind(targetKind);
  return kind ? fieldsFor(kind) : NO_FIELDS;
};

/**
 * One referenced record's value at one path, as text. Anything that does not
 * resolve to something readable — an unknown collection, an id the collection
 * does not hold, an absent or structured value — comes back undefined, and the
 * cell falls back to the id it was already showing.
 */
const resolveIdRefDisplayValue = (
  targetKind: string,
  id: string,
  displayField: string,
): string | undefined => {
  const kind = asEntityKind(targetKind);
  if (!kind) return undefined;
  const row = rowsFor(kind).get(id);
  return row ? asDisplayText(getPath(row, displayField)) : undefined;
};

export { resolveIdRefDisplayValue, resolveIdRefTargetFields };
