/* @layer store-api @kind logic */
/** Retention after an approval: an item keeps the files of its newest approved versions, as
 *  many as STORE_LIMITS.filesKept gives its kind, and the older approved versions lose theirs.
 *  Their rows stay, stamped as pruned. The live version is the newest approved one, so it is
 *  always kept. */
import { STORE_LIMITS } from '../../../../shared/store/limits';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import { itemsRepo } from '../db/items-repo';
import { removeFile, stampRemoved } from './remove-file';

const filesToPrune = (item: Pick<StoreItem, 'kind' | 'versions' | 'liveVersion'>): StoreVersion[] =>
  item.versions
    .filter((version) => version.review.state === 'approved' && !version.removed)
    .sort((a, b) => b.n - a.n)
    .slice(STORE_LIMITS.filesKept[item.kind])
    .filter((version) => version.n !== item.liveVersion);

const pruneFiles = async (item: StoreItem, at: number): Promise<StoreItem> => {
  if (filesToPrune(item).length === 0) return item;
  let pruned: StoreVersion[] = [];
  const updated = await itemsRepo.mutate(item.id, (latest) => {
    pruned = filesToPrune(latest);
    const doomed = new Set(pruned.map((version) => version.n));
    const versions = latest.versions.map((version) =>
      (doomed.has(version.n) ? stampRemoved(version, { at, reason: 'pruned', by: null }) : version));
    return { versions };
  });
  await Promise.all(pruned.map(removeFile));
  return updated;
};

export { filesToPrune, pruneFiles };
