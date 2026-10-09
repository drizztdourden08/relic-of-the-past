/* @layer sanctuary-site @kind logic */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor } from '@ds/data/schema/field-descriptor';
import type { FileRow } from './file-row';
import { FILE_SCHEMA_CONFIG, SAMPLE_ROWS } from './file-schema.constants';

const buildFileSchema = (rows: readonly FileRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], FILE_SCHEMA_CONFIG);

export { buildFileSchema };
