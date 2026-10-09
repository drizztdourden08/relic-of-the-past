/* @layer store-api @kind logic */
import type { StoreItem } from '../../../../../shared/store/types';

const hasWaitingVersion = ({ versions }: Pick<StoreItem, 'versions'>): boolean =>
  versions.some((version) => version.review.state === 'waiting');

export { hasWaitingVersion };
