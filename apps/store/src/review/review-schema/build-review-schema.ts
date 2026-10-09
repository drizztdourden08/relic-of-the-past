/* @layer store-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { ReviewRow } from '../review-row/review-row.type';
import { REVIEW_SCHEMA_CONFIG, SAMPLE_ROWS } from './review-schema.constants';

const buildReviewSchema = (rows: readonly ReviewRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], REVIEW_SCHEMA_CONFIG);

export { buildReviewSchema };
