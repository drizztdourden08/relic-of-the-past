/* @layer store-site @kind logic */
/**
 * The schema FilterBar and DataTable read for the review queue, built over one sample row
 * per kind of change and per item kind, so both enums are complete on an empty queue.
 */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor, SchemaConfig } from '@ds/data/schema/field-descriptor';
import type { TableColumn } from '@ds/data/table/types';
import type { ReviewRow } from './review-row';

const sample = (change: ReviewRow['change'], kind: ReviewRow['kind']): ReviewRow => ({
  id: `sample-${change}-${kind}`,
  item: 'sample',
  kind,
  change,
  author: 'sample',
  size: '0 B',
  submitted: '0000-00-00 00:00',
});

const SAMPLE_ROWS: readonly ReviewRow[] = [sample('new item', 'music'), sample('update', 'character'), sample('listing edit', 'language')];

const REVIEW_SCHEMA_CONFIG: SchemaConfig = {
  order: ['item', 'kind', 'change', 'author', 'size', 'submitted'],
  labels: { item: 'Item', kind: 'Kind', change: 'Change', author: 'Author', size: 'Size', submitted: 'Submitted' },
  hidden: ['id'],
  kinds: { item: 'string', author: 'string', size: 'string', submitted: 'string', kind: 'enum', change: 'enum' },
};

const REVIEW_DEFAULT_COLUMNS: readonly TableColumn[] = [
  { path: 'item', grow: true },
  { path: 'kind', fit: true },
  { path: 'change', fit: true },
  { path: 'author', fit: true },
  { path: 'size', fit: true },
  { path: 'submitted', fit: true },
];

const buildReviewSchema = (rows: readonly ReviewRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], REVIEW_SCHEMA_CONFIG);

export { buildReviewSchema, REVIEW_DEFAULT_COLUMNS };
