/* @layer root-config @kind logic */
import type { SanctuaryFile } from '../../../../shared/sanctuary';
import { fileKey } from '../storage/keys';
import type { StoredFile } from './upgrade-file.type';

const upgradeFile = (stored: StoredFile): SanctuaryFile => {
  if (stored.versions?.length) return { ...stored, versions: stored.versions, currentVersion: stored.currentVersion ?? 1 };
  const implicitFirstVersion = {
    n: 1,
    key: fileKey(stored.id),
    name: stored.name,
    bytes: stored.bytes,
    sha256: stored.sha256,
    contentType: stored.contentType,
    note: '',
    by: stored.owner,
    status: 'ready' as const,
    upload: null,
    createdAt: stored.createdAt,
  };
  return { ...stored, versions: [implicitFirstVersion], currentVersion: 1 };
};

export { upgradeFile };
