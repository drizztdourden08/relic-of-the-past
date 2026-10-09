/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { formatBytes, formatDateTime } from '@rotp/hub-client';
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
