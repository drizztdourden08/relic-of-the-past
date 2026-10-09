/* @layer store-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { PublicationRow } from '../publication-row/publication-row.type';
import { PUBLICATION_SCHEMA_CONFIG, SAMPLE_ROWS } from './publication-schema.constants';

const buildPublicationSchema = (rows: readonly PublicationRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], PUBLICATION_SCHEMA_CONFIG);

export { buildPublicationSchema };
