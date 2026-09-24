/* @layer sanctuary-site @kind constants */
/** The static scopes of the Files page: one tab per file type, plus the user's own. */
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';

type Scope = {
  id: string;
  label: string;
};

const ALL_SCOPE_ID = 'all';
const MINE_SCOPE_ID = 'mine';

/** Tab wording, plural where the type label is singular. */
const SCOPE_TYPE_LABELS: Record<FileType, string> = {
  build: 'Test builds',
  'save-state': 'Save states',
  sprite: 'Sprites & art',
  music: 'Music',
  document: 'Documents',
  other: 'Other',
};

const FILE_SCOPES: Scope[] = [
  { id: ALL_SCOPE_ID, label: 'All' },
  ...FILE_TYPES.map((type) => ({ id: type, label: SCOPE_TYPE_LABELS[type] })),
  { id: MINE_SCOPE_ID, label: 'Uploaded by me' },
];

const DEFAULT_UPLOAD_TYPE: FileType = 'other';

const isFileType = (id: string): id is FileType => (FILE_TYPES as readonly string[]).includes(id);

export { FILE_SCOPES, SCOPE_TYPE_LABELS, ALL_SCOPE_ID, MINE_SCOPE_ID, DEFAULT_UPLOAD_TYPE, isFileType };
export type { Scope };
