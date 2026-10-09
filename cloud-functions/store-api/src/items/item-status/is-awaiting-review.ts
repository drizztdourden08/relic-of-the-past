/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';
import { hasWaitingVersion } from './has-waiting-version';

const isAwaitingReview = (item: Pick<StoreItem, 'versions' | 'listingEdits'>): boolean =>
  hasWaitingVersion(item) || item.listingEdits.some((edit) => edit.review.state === 'waiting');

export { isAwaitingReview };
