/* @layer store-site @kind logic */
/**
 * Which pack the review page reads. A version reads its own file, unless the file was
 * removed or is still uploading. A listing edit carries no pack, so it reads the live
 * version's, when there is one.
 */
import type { ReviewEntry } from '@shared/store/api-types';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { versionOfEntry } from '../../../review/review-row';

type PackTarget = {
  /** The version whose pack is read; null when there is none to read. */
  n: number | null;
  /** Why nothing is read. */
  noPack: string | null;
  /** A line over the contents when they are not the entry's own. */
  note: string | null;
};

const packTargetOf = (entry: ReviewEntry): PackTarget => {
  const version = versionOfEntry(entry);
  if (version) {
    if (version.removed) return { n: null, noPack: `The file of ${version.semver} was removed.`, note: null };
    if (version.review.state === 'uploading') return { n: null, noPack: `${version.semver} is still uploading.`, note: null };
    return { n: version.n, noPack: null, note: null };
  }
  const live = liveVersionOf(entry.item);
  if (!live || live.removed) return { n: null, noPack: 'There is no pack in this change.', note: null };
  return { n: live.n, noPack: null, note: `There is no pack in this change. These are the contents of the live version, ${live.semver}.` };
};

export { packTargetOf };
export type { PackTarget };
