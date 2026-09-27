/* @layer store-api @kind logic */
/** Plain `major.minor.patch` versions, the only shape the begin schema accepts. A new
 *  version must be above every version that is live, approved or still in flight; a
 *  rejected or withdrawn number may be used again. */
import type { StoreVersion } from '../../../../shared/store/types';

const partsOf = (semver: string): number[] => semver.split('.').map(Number);

/** Negative when `a` is lower, zero when equal, positive when higher. */
const compareSemver = (a: string, b: string): number => {
  const [left, right] = [partsOf(a), partsOf(b)];
  for (let i = 0; i < 3; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const countsForOrder = (version: StoreVersion): boolean =>
  version.review.state !== 'rejected' && version.review.state !== 'withdrawn';

/** The highest semver the next version must pass, or null when there is none yet. */
const highestSemver = (versions: StoreVersion[]): string | null =>
  versions.filter(countsForOrder).reduce<string | null>(
    (top, version) => (top === null || compareSemver(version.semver, top) > 0 ? version.semver : top),
    null,
  );

const isNextSemver = (versions: StoreVersion[], semver: string): boolean => {
  const top = highestSemver(versions);
  return top === null || compareSemver(semver, top) > 0;
};

export { compareSemver, highestSemver, isNextSemver };
