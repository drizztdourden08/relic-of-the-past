/* @layer store-api @kind logic */
import { hasRight } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import { isAuthor } from './is-author';
import type { Viewer } from './project-item.type';

const canSeeReviews = (item: Pick<StoreItem, 'author'>, viewer: Viewer): boolean =>
  isAuthor(item, viewer) || hasRight(viewer.rights, 'review');

export { canSeeReviews };
