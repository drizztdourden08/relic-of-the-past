/* @layer sanctuary-site @kind constants */
import { FILE_TYPES } from '@rotp/hub-contracts';
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
import type { FileRow } from './file-row';

const SAMPLE_ROWS: readonly FileRow[] = FILE_TYPES.map((type, index) => ({
  id: `sample-${index}`,
  name: `sample.${type}`,
  type,
  tags: ['sample'],
  version: '0.0.0',
  rev: 'v1',
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
    'name', 'type', 'tags', 'rev', 'version', 'owner', 'size', 'bytes', 'note', 'stats', 'createdAt', 'expiresAt',
  ],
  labels: {
    name: 'Name',
    type: 'Type',
    tags: 'Tags',
    rev: 'Rev',
    version: 'App version',
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
    rev: 'string',
    version: 'string',
    'owner.displayName': 'enum',
    size: 'string',
    note: 'string',
    createdAt: 'string',
    expiresAt: 'string',
  },
};

const FILE_DEFAULT_COLUMNS: readonly TableColumn[] = [
  { path: 'name', grow: true },
  { path: 'tags', fit: true },
  { path: 'rev', fit: true },
  { path: 'version', fit: true },
  { path: 'owner.displayName', fit: true },
  { path: 'createdAt', fit: true },
  { path: 'size', fit: true },
];

const OWNER_NAME_PATH = 'owner.displayName';

export { SAMPLE_ROWS, FILE_SCHEMA_CONFIG, FILE_DEFAULT_COLUMNS, OWNER_NAME_PATH };
