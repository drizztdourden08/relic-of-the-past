/* @layer renderer-app @kind logic */
/**
 * The reading half of the id-reference handoff (sibling of `id-ref-options`).
 * A table column can show a field of the record it points at instead of the
 * id; which fields exist and what a record holds are dataset facts, so they
 * are answered here and injected. Field lists and the by-id index are cached
 * per collection: the rows never change, and without the index every cell in
 * a nine-hundred-row table would scan the target collection on every render.
 */
import { buildSchema, getPath } from '@ds/data';
import { COLLECTION_SOURCES } from './collection-sources';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import type { IdRefTargetField } from '@ds/composites/DataTable';
import type { InspectorRow } from '../DataInspector.type';

/** Container kinds address nothing on their own. Only their leaves do. */
const CONTAINER_KINDS: readonly FieldDescriptor['kind'][] = ['object', 'union', 'array'];

const NO_FIELDS: readonly IdRefTargetField[] = [];

const fieldCache = new Map<EntityKind, readonly IdRefTargetField[]>();

const rowCache = new Map<EntityKind, ReadonlyMap<string, InspectorRow>>();

const asEntityKind = (value: string): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

/** Every leaf of the schema, nested ones included; paths are already dotted. */
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

/** One referenced record's value at one path, as text. Undefined when it does
 *  not resolve to something readable; the cell then falls back to the id. */
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
