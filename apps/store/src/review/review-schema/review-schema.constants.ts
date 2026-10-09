/* @layer store-site @kind constants */
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { ReviewRow } from '../review-row/review-row.type';
import { sampleRow } from './sample-row';

const SAMPLE_ROWS: readonly ReviewRow[] = [sampleRow('new item', 'music'), sampleRow('update', 'character'), sampleRow('listing edit', 'language')];

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

export { SAMPLE_ROWS, REVIEW_SCHEMA_CONFIG, REVIEW_DEFAULT_COLUMNS };
