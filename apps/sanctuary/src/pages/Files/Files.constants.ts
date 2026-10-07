/* @layer sanctuary-site @kind constants */
/** The static scopes of the Files page: one tab per file type, plus the user's own. */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';

type Scope = {
  id: string;
  label: string;
};

const ALL_SCOPE_ID = 'all';
const MINE_SCOPE_ID = 'mine';

const FILE_SCOPES: Scope[] = [
  { id: ALL_SCOPE_ID, label: 'All' },
  ...FILE_TYPES.map((type) => ({ id: type, label: FILE_TYPE_SHELF_LABELS[type] })),
  { id: MINE_SCOPE_ID, label: 'Uploaded by me' },
];

const DEFAULT_UPLOAD_TYPE: FileType = 'other';

/** Above this total a batch download is not zipped in the browser; each file is saved on its own. */
const BATCH_ZIP_MAX_BYTES = 500 * 1024 * 1024;

/** The pause between two saves of a batch download that is not zipped. */
const BATCH_SAVE_GAP_MS = 800;

/** Tiles the selection panel draws before it sums up the rest. */
const SELECTION_TILE_MAX = 12;

const isFileType = (id: string): id is FileType => (FILE_TYPES as readonly string[]).includes(id);

export {
  FILE_SCOPES,
  ALL_SCOPE_ID,
  MINE_SCOPE_ID,
  DEFAULT_UPLOAD_TYPE,
  BATCH_ZIP_MAX_BYTES,
  BATCH_SAVE_GAP_MS,
  SELECTION_TILE_MAX,
  isFileType,
};
export type { Scope };
