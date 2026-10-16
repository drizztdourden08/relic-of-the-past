/* @layer sanctuary-site @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { formatBytes } from '@rotp/hub-client';
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
  createdAt: formatDate(file.createdAt, 'iso'),
  expiresAt: file.expiresAt === null ? null : formatDate(file.expiresAt, 'iso'),
});

export { toFileRow };
