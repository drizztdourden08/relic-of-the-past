/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { canSeeReviews } from './can-see-reviews';
import type { Viewer } from './project-item.type';
import { publicVersion } from './public-version';

const projectItem = (item: StoreItem, viewer: Viewer): StoreItem => {
  if (canSeeReviews(item, viewer)) return item;
  const versions = item.versions.filter((version) => version.review.state === 'approved').map(publicVersion);
  return { ...item, versions, listingEdits: [] };
};

export { projectItem };
