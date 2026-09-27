/* @layer store-api @kind logic */
/** The one place that decides what a viewer sees of an item. The author, reviewers and
 *  admins see the whole record. Everyone else sees a published item only, with its approved
 *  versions: no incoming key, no upload, no reviewer, no note and no listing edits. */
import { hasRight } from '../../../../shared/hub/rights';
import type { Rights } from '../../../../shared/hub/group-types';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';

/** The parts of a caller the projection reads; a hub-core Member has them. */
type Viewer = { caller: { userId: string }; rights: Rights };

const isAuthor = (item: Pick<StoreItem, 'author'>, viewer: Viewer): boolean => viewer.caller.userId === item.author.userId;

/** hasRight counts an admin as holding every permission. */
const canSeeReviews = (item: Pick<StoreItem, 'author'>, viewer: Viewer): boolean =>
  isAuthor(item, viewer) || hasRight(viewer.rights, 'review');

const canView = (item: Pick<StoreItem, 'author' | 'status'>, viewer: Viewer): boolean =>
  item.status === 'published' || canSeeReviews(item, viewer);

const publicVersion = (version: StoreVersion): StoreVersion => ({
  ...version,
  key: '',
  upload: null,
  review: {
    state: 'approved',
    submittedAt: version.review.submittedAt,
    decidedAt: version.review.decidedAt,
    by: null,
    note: '',
  },
});

const projectItem = (item: StoreItem, viewer: Viewer): StoreItem => {
  if (canSeeReviews(item, viewer)) return item;
  const versions = item.versions.filter((version) => version.review.state === 'approved').map(publicVersion);
  return { ...item, versions, listingEdits: [] };
};

export { projectItem, canSeeReviews, canView, isAuthor };
export type { Viewer };
