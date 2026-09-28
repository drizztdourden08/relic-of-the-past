/* @layer store-api @kind logic */
/** The daily job's file expiry. A rejected version keeps its file STORE_LIMITS.rejectedKeepDays
 *  after the rejection, and a ready version never sent for review keeps it
 *  STORE_LIMITS.readyKeepDays after its upload started (fileExpiresAt). Past that the file
 *  leaves the bucket and the row stays, stamped with the reason. */
import type { VersionRef } from '../../../../shared/store/api-types';
import type { RemovalReason, StoreItem, StoreVersion } from '../../../../shared/store/types';
import { fileExpiresAt } from '../../../../shared/store/version-flow';
import { itemsRepo } from '../db/items-repo';
import { removeFile, stampRemoved } from '../items/remove-file';
import { replaceVersion, versionOf } from '../items/versions';

const isExpired = (version: StoreVersion, at: number): boolean => {
  const until = fileExpiresAt(version);
  return until !== null && at >= until;
};

const reasonOf = (version: StoreVersion): RemovalReason =>
  (version.review.state === 'rejected' ? 'rejected-expired' : 'ready-expired');

const expireFile = async ({ itemId, n }: VersionRef, at: number): Promise<void> => {
  const updated = await itemsRepo.mutate(itemId, (latest) => {
    const version = versionOf(latest, n);
    if (!version || !isExpired(version, at)) return {};
    return { versions: replaceVersion(latest, stampRemoved(version, { at, reason: reasonOf(version), by: null })) };
  });
  const version = versionOf(updated, n);
  if (version?.removed?.at === at) await removeFile(version);
};

/** Removes every file past its keep time and answers which versions lost theirs. */
const expireFiles = async (items: StoreItem[], at: number): Promise<VersionRef[]> => {
  const expired = items.flatMap((item) =>
    item.versions.filter((version) => isExpired(version, at)).map((version) => ({ itemId: item.id, n: version.n })));
  for (const ref of expired) await expireFile(ref, at);
  return expired;
};

export { expireFiles };
