/* @layer sanctuary-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { FileRow } from './file-row';
import { FILE_SCHEMA_CONFIG, SAMPLE_ROWS } from './file-schema.constants';

const buildFileSchema = (rows: readonly FileRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], FILE_SCHEMA_CONFIG);

export { buildFileSchema };
