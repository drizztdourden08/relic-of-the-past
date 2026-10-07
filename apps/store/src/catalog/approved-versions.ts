/* @layer store-site @kind logic */
/**
 * The approved versions of an item as a player sees them, newest first, with the day each
 * was approved. A player's copy of an item comes projected: its versions carry
 * `approvedAt` in place of the review record. The author's and a reviewer's copy carries the
 * review, so both shapes are read here.
 */
import type { StoreItem, StoreVersion } from '@shared/store/types';

type ProjectedVersion = StoreVersion & { approvedAt?: number | null };

const isApproved = (version: ProjectedVersion): boolean =>
  !version.review || version.review.state === 'approved';

const approvedAtOf = (version: ProjectedVersion): number =>
  version.review?.decidedAt ?? version.approvedAt ?? version.createdAt;

const approvedVersions = (item: StoreItem): StoreVersion[] =>
  item.versions.filter(isApproved).sort((a, b) => b.n - a.n);

const liveVersionOf = (item: StoreItem): StoreVersion | null =>
  item.versions.find((version) => version.n === item.liveVersion) ?? null;

export { approvedVersions, approvedAtOf, liveVersionOf };
