/* @layer root-config @kind logic */
/** A file stored before versions existed reads as its own version 1, pointing
 *  at the object it already has. The first write that touches `versions`
 *  stores the upgraded shape, so no record ever needs a migration pass. */
import type { SanctuaryFile } from '../../../../shared/sanctuary';
import { fileKey } from '../storage/b2';

type StoredFile = Omit<SanctuaryFile, 'versions' | 'currentVersion'> &
  Partial<Pick<SanctuaryFile, 'versions' | 'currentVersion'>>;

const upgradeFile = (stored: StoredFile): SanctuaryFile => {
  // Stored versions always win. A file whose first version was written before the pointer
  // was (a version begun on a pre-versions file) points at v1 until something moves it.
  if (stored.versions?.length) return { ...stored, versions: stored.versions, currentVersion: stored.currentVersion ?? 1 };
  const v1 = {
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
  return { ...stored, versions: [v1], currentVersion: 1 };
};

export { upgradeFile };
export type { StoredFile };
