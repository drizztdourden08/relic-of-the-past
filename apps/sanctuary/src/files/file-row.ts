/* @layer sanctuary-site @kind logic */
/**
 * The row the Files table shows: the record's fields the table can use, dates as sortable
 * text, and a readable size beside the raw byte count. Upload bookkeeping (status, the
 * multipart id, the content type) stays off the row, so the schema never offers it.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { formatBytes } from '../lib/format-bytes';
import { formatDateTime } from '../lib/format-date';
import { versionLabel } from './file-versions';

type FileRow = Pick<SanctuaryFile, 'id' | 'name' | 'type' | 'tags' | 'version' | 'owner' | 'bytes' | 'note' | 'stats'> & {
  /** The version in use, as `v3`. `version` stays the app version the file relates to. */
  rev: string;
  size: string;
  createdAt: string;
  expiresAt: string | null;
};

const toFileRow = (file: SanctuaryFile): FileRow => ({
  id: file.id,
  name: file.name,
  type: file.type,
  tags: file.tags,
  version: file.version,
  rev: versionLabel(file.currentVersion),
  owner: file.owner,
  bytes: file.bytes,
  size: formatBytes(file.bytes),
  note: file.note,
  stats: file.stats,
  createdAt: formatDateTime(file.createdAt),
  expiresAt: file.expiresAt === null ? null : formatDateTime(file.expiresAt),
});

const fileRowId = (row: FileRow) => row.id;

export { toFileRow, fileRowId };
export type { FileRow };
