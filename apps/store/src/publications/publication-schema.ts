/* @layer store-site @kind logic */
/**
 * The schema FilterBar and DataTable read for My publications, built from the rows over
 * one sample row per review state, so the state enum is complete before the first upload.
 * The table groups by item.
 */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor, SchemaConfig } from '@ds/data/schema/field-descriptor';
import type { TableColumn } from '@ds/data/table/types';
import type { PublicationRow } from './publication-row';

const STATES = ['draft', 'uploading', 'waiting', 'approved', 'rejected', 'withdrawn'];

const SAMPLE_ROWS: readonly PublicationRow[] = STATES.map((review) => ({
  id: `sample-${review}`,
  itemId: 'sample',
  item: 'sample',
  entry: 'sample',
  kind: 'music',
  semver: '0.0.0',
  review,
  submitted: '0000-00-00 00:00',
  reviewedBy: 'sample',
  reviewedAt: '0000-00-00 00:00',
  note: 'sample',
  installs: '0',
}));

const PUBLICATION_SCHEMA_CONFIG: SchemaConfig = {
  order: ['item', 'entry', 'kind', 'semver', 'review', 'submitted', 'reviewedBy', 'reviewedAt', 'note', 'installs'],
  labels: {
    item: 'Item',
    entry: 'Entry',
    kind: 'Kind',
    semver: 'Version',
    review: 'Review',
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
  { path: 'submitted', fit: true },
  { path: 'reviewedBy', fit: true },
  { path: 'note', grow: true },
  { path: 'installs', fit: true },
];

const PUBLICATION_DEFAULT_GROUP_BY: readonly string[] = ['item'];

const buildPublicationSchema = (rows: readonly PublicationRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], PUBLICATION_SCHEMA_CONFIG);

export { buildPublicationSchema, PUBLICATION_DEFAULT_COLUMNS, PUBLICATION_DEFAULT_GROUP_BY };
