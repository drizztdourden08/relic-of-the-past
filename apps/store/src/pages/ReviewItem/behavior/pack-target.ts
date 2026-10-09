/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { versionOfEntry } from '../../../review/review-row';
import type { PackTarget } from './pack-target.type';

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
