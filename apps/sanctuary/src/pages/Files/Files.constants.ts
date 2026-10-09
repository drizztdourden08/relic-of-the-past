/* @layer sanctuary-site @kind constants */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import type { Scope } from './Files.type';

const ALL_SCOPE_ID = 'all';
const MINE_SCOPE_ID = 'mine';

const FILE_SCOPES: Scope[] = [
  { id: ALL_SCOPE_ID, label: 'All' },
  ...FILE_TYPES.map((type) => ({ id: type, label: FILE_TYPE_SHELF_LABELS[type] })),
  { id: MINE_SCOPE_ID, label: 'Uploaded by me' },
];

const DEFAULT_UPLOAD_TYPE: FileType = 'other';

const BATCH_ZIP_MAX_BYTES = 500 * 1024 * 1024;

const BATCH_SAVE_GAP_MS = 800;

const SELECTION_TILE_MAX = 12;

const COUNT_LABEL = ['file', 'files'] as const;
const SEARCH_PLACEHOLDER = 'Search files...';

export {
  FILE_SCOPES,
  ALL_SCOPE_ID,
  MINE_SCOPE_ID,
  DEFAULT_UPLOAD_TYPE,
  BATCH_ZIP_MAX_BYTES,
  BATCH_SAVE_GAP_MS,
  SELECTION_TILE_MAX,
  COUNT_LABEL,
  SEARCH_PLACEHOLDER,
};
