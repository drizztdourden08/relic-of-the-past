/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import { versionLabel } from '../file-versions';
import type { FileRow } from './file-row.type';

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

export { toFileRow };
