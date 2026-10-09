/* @layer renderer-app @kind logic */
import type { FieldDescriptor, TableColumn } from '@drizztdourden08/tessera/data';
import { displayFieldFor } from './display-field-for';

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

export { buildDefaultColumns };
