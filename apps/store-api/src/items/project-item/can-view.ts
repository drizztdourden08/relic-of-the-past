/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { canSeeReviews } from './can-see-reviews';
import type { Viewer } from './project-item.type';

const canView = (item: Pick<StoreItem, 'author' | 'status'>, viewer: Viewer): boolean =>
  item.status === 'published' || canSeeReviews(item, viewer);

export { canView };
