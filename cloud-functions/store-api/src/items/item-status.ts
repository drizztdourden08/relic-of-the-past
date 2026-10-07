/* @layer store-api @kind logic */
/** An item's status follows from its versions: published once a version is approved,
 *  waiting while its first version is in the queue, a draft before that. Unlisted is set by
 *  a reviewer and outlasts every other change until a relist. */
import type { ItemStatus, StoreItem } from '../../../../shared/store/types';

type StatusInput = Pick<StoreItem, 'status' | 'liveVersion' | 'versions'>;

const hasWaitingVersion = ({ versions }: Pick<StoreItem, 'versions'>): boolean =>
  versions.some((version) => version.review.state === 'waiting');

/** The status the versions give, ignoring an unlist. */
const baseStatus = (item: StatusInput): ItemStatus => {
  if (item.liveVersion !== null) return 'published';
  return hasWaitingVersion(item) ? 'waiting' : 'draft';
};

const statusAfter = (item: StatusInput): ItemStatus => (item.status === 'unlisted' ? 'unlisted' : baseStatus(item));

/** Whether a version or a listing edit of this item waits in the review queue. */
const isAwaitingReview = (item: Pick<StoreItem, 'versions' | 'listingEdits'>): boolean =>
  hasWaitingVersion(item) || item.listingEdits.some((edit) => edit.review.state === 'waiting');

export { baseStatus, statusAfter, isAwaitingReview, hasWaitingVersion };
