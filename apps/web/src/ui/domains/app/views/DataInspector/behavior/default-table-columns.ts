/* @layer renderer-app @kind logic */
/**
 * Turns a collection's curated visible-column list — plain paths, already
 * chosen per collection in `schema-config/` — into the full column specs
 * `DataTable` actually wants. The curated PATH LIST itself is untouched; this
 * only fills in how those columns size and display, which is what "add the
 * fit-to-content and display-field defaults on top of the existing curation"
 * means: every default column opens in the persistent fit-to-content mode,
 * and a reference column defaults to showing the target collection's own
 * name field instead of the raw id it points at.
 *
 * A collection with no curated list at all (area, location) is left on
 * `DataTable`'s own schema-derived fallback — `fallbackColumns` stays
 * `undefined` for those, same as before this file existed.
 */
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor, TableColumn } from '@ds/data';

/**
 * Every collection's own display identity — the field a reference to it
 * should show in place of the raw id. `randomizerName` is the game-facing
 * name the rest of the app already shows for most of these (see each
 * record's own type); a connection and a tag name themselves differently
 * (`name`), and item-group/enumeration name themselves by `label`, but it
 * is the same kind of field either way.
 */
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

/**
 * `undefined` for anything that isn't a reference, or references a kind this
 * screen doesn't know — the column then falls back to showing the id, same
 * as it always has.
 */
const displayFieldFor = (field: FieldDescriptor | undefined): string | undefined => {
  if (!field || field.kind !== 'idRef') return undefined;
  const kind = asEntityKind(field.targetKind);
  return kind ? NAME_FIELD_BY_KIND[kind] : undefined;
};

/**
 * Every curated path is a top-level one, so the schema is searched flat
 * rather than walked — `buildSchema`'s own output, not an index, is enough.
 */
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
