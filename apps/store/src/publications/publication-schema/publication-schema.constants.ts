/* @layer store-site @kind constants */
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { PublicationRow } from '../publication-row/publication-row.type';

const STATES = ['draft', 'uploading', 'ready', 'waiting', 'approved', 'rejected', 'deleted', 'expired', 'withdrawn'];

const SAMPLE_ROWS: readonly PublicationRow[] = STATES.map((review) => ({
  id: `sample-${review}`,
  itemId: 'sample',
  item: 'sample',
  entry: 'sample',
  kind: 'music',
  semver: '0.0.0',
  review,
  file: 'sample',
  submitted: '0000-00-00 00:00',
  reviewedBy: 'sample',
  reviewedAt: '0000-00-00 00:00',
  note: 'sample',
  installs: '0',
}));

const PUBLICATION_SCHEMA_CONFIG: SchemaConfig = {
  order: ['item', 'entry', 'kind', 'semver', 'review', 'file', 'submitted', 'reviewedBy', 'reviewedAt', 'note', 'installs'],
  labels: {
    item: 'Item',
    entry: 'Entry',
    kind: 'Kind',
    semver: 'Version',
    review: 'State',
    file: 'File',
    submitted: 'Submitted',
    reviewedBy: 'Reviewed by',
    reviewedAt: 'Reviewed at',
    note: 'Note',
    installs: 'Installs',
  },
  hidden: ['id', 'itemId'],
  kinds: {
    item: 'string',
    entry: 'string',
    semver: 'string',
    file: 'string',
    submitted: 'string',
    reviewedBy: 'string',
    reviewedAt: 'string',
    note: 'string',
    installs: 'string',
    review: 'enum',
    kind: 'enum',
  },
};

const PUBLICATION_DEFAULT_COLUMNS: readonly TableColumn[] = [
  { path: 'entry', grow: true },
  { path: 'semver', fit: true },
  { path: 'review', fit: true },
  { path: 'file', fit: true },
  { path: 'submitted', fit: true },
  { path: 'reviewedBy', fit: true },
  { path: 'note', grow: true },
  { path: 'installs', fit: true },
];

const PUBLICATION_DEFAULT_GROUP_BY: readonly string[] = ['item'];

export { STATES, SAMPLE_ROWS, PUBLICATION_SCHEMA_CONFIG, PUBLICATION_DEFAULT_COLUMNS, PUBLICATION_DEFAULT_GROUP_BY };
