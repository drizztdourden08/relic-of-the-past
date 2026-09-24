/* @layer sanctuary-site @kind logic */
/**
 * The schema FilterBar and DataTable read for files. Built the inspector's way, from the
 * rows through the schema builder, over one sample row per file type, so every type is
 * an option of the enum and every field exists before the first file is listed.
 */
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor, SchemaConfig } from '@ds/data/schema/field-descriptor';
import type { TableColumn } from '@ds/data/table/types';
import type { FileRow } from './file-row';

const SAMPLE_ROWS: readonly FileRow[] = FILE_TYPES.map((type, index) => ({
  id: `sample-${index}`,
  name: `sample.${type}`,
  type,
  tags: ['sample'],
  version: '0.0.0',
  owner: { userId: 'sample', displayName: 'sample' },
  bytes: 0,
  size: '0 B',
  note: '',
  stats: { downloads: 0 },
  createdAt: '0000-00-00 00:00',
  expiresAt: null,
}));

const FILE_SCHEMA_CONFIG: SchemaConfig = {
  order: [
    'name', 'type', 'tags', 'version', 'owner', 'size', 'bytes', 'note', 'stats', 'createdAt', 'expiresAt',
  ],
  labels: {
    name: 'Name',
    type: 'Type',
    tags: 'Tags',
    version: 'Version',
    'owner.displayName': 'Owner',
    size: 'Size',
    bytes: 'Bytes',
    note: 'Note',
    'stats.downloads': 'Downloads',
    createdAt: 'Uploaded',
    expiresAt: 'Expires',
  },
  hidden: ['id', 'owner.userId'],
  kinds: {
    name: 'string',
    tags: 'array',
    'tags[]': 'string',
    version: 'string',
    'owner.displayName': 'string',
    size: 'string',
    note: 'string',
    createdAt: 'string',
    expiresAt: 'string',
  },
};

const FILE_DEFAULT_COLUMNS: readonly TableColumn[] = [
  { path: 'name', grow: true },
  { path: 'tags', fit: true },
  { path: 'version', fit: true },
  { path: 'owner.displayName', fit: true },
  { path: 'createdAt', fit: true },
  { path: 'size', fit: true },
];

const buildFileSchema = (rows: readonly FileRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], FILE_SCHEMA_CONFIG);

export { buildFileSchema, FILE_DEFAULT_COLUMNS };
