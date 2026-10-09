/* @layer sanctuary-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { FileRow } from './file-row';
import { FILE_SCHEMA_CONFIG, OWNER_NAME_PATH, SAMPLE_ROWS } from './file-schema.constants';

const ownerNames = (rows: readonly FileRow[]): readonly string[] =>
  [...new Set(rows.map((row) => row.owner.displayName))].sort((a, b) => a.localeCompare(b));

const withOwnerOptions = (field: FieldDescriptor, names: readonly string[]): FieldDescriptor => {
  if (field.path === OWNER_NAME_PATH) return { ...field, options: names };
  if (!field.children) return field;
  return { ...field, children: field.children.map((child) => withOwnerOptions(child, names)) };
};

const buildFileSchema = (rows: readonly FileRow[]): readonly FieldDescriptor[] => {
  const names = ownerNames(rows);
  return buildSchema([...SAMPLE_ROWS, ...rows], FILE_SCHEMA_CONFIG).map((field) => withOwnerOptions(field, names));
};

export { buildFileSchema };
