/* @layer renderer-app @kind logic */
/**
 * Turns a collection's curated column paths (`schema-config/`) into `DataTable`
 * column specs: every default column opens fit-to-content, and a reference
 * column shows the target collection's name field instead of the raw id.
 * Collections with no curated list (area, location) stay on `DataTable`'s own
 * schema-derived fallback.
 */
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor, TableColumn } from '@ds/data';

/** The field a reference to each collection shows in place of the raw id. */
const NAME_FIELD_BY_KIND: Partial<Record<EntityKind, string>> = {
  screen: 'randomizerName',
  connection: 'name',
  check: 'randomizerName',
  item: 'randomizerName',
  dungeon: 'randomizerName',
  area: 'randomizerName',
  location: 'randomizerName',
  actor: 'randomizerName',
  tag: 'name',
  'item-group': 'label',
  enumeration: 'label',
};

const asEntityKind = (value: string | undefined): EntityKind | undefined =>
  ENTITY_KINDS.find((kind) => kind === value);

/** `undefined` for non-references or unknown kinds; the column then shows the id. */
const displayFieldFor = (field: FieldDescriptor | undefined): string | undefined => {
  if (!field || field.kind !== 'idRef') return undefined;
  const kind = asEntityKind(field.targetKind);
  return kind ? NAME_FIELD_BY_KIND[kind] : undefined;
};

/** Every curated path is top-level, so the schema is searched flat, not walked. */
const buildDefaultColumns = (
  paths: readonly string[],
  schema: readonly FieldDescriptor[],
): readonly TableColumn[] =>
  paths.map((path) => {
    const displayField = displayFieldFor(schema.find((field) => field.path === path));
    const column: TableColumn = { path, fit: true };
    if (displayField) column.displayField = displayField;
    return column;
  });

export { NAME_FIELD_BY_KIND, buildDefaultColumns };
