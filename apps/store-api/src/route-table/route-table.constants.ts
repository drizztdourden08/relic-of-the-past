/* @layer store-api @kind constants */
import { accountRoutes } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { STORE_SITE } from '../site.constants';
import { home } from '../routes/home';
import { itemsList } from '../routes/items-list';
import { itemsGet } from '../routes/items-get';
import { authorsGet } from '../routes/authors-get';
import { itemsCreate } from '../routes/items-create';
import { itemsMedia } from '../routes/items-media';
import { itemsListing } from '../routes/items-listing';
import { versionsBegin } from '../routes/versions-begin';
import { versionsSignParts } from '../routes/versions-sign-parts';
import { versionsParts } from '../routes/versions-parts';
import { versionsComplete } from '../routes/versions-complete';
import { versionsAbort } from '../routes/versions-abort';
import { versionsWithdraw } from '../routes/versions-withdraw';
import { versionsSubmit } from '../routes/versions-submit';
import { versionsDelete } from '../routes/versions-delete';
import { download } from '../routes/download';
import { itemsPack } from '../routes/items-pack';
import { ratingPut } from '../routes/rating-put';
import { ratingDelete } from '../routes/rating-delete';
import { myPublications } from '../routes/my-publications';
import { reviewQueue } from '../routes/review-queue';
import { reviewUnsubmitted } from '../routes/review-unsubmitted';
import { reviewDecide } from '../routes/review-decide';
import { reviewPack } from '../routes/review-pack';
import { itemsUnlist } from '../routes/items-unlist';
import { itemsRelist } from '../routes/items-relist';
import { homeFeatured } from '../routes/home-featured';
import { itemsFeature } from '../routes/items-feature';
import { itemsUnfeature } from '../routes/items-unfeature';
import { homeWelcome } from '../routes/home-welcome';
import { usersBan } from '../routes/users-ban';
import { jobsDaily } from '../routes/jobs-daily';
import { isSanctuaryOnly } from './is-sanctuary-only';

const STORE_OWN_ROUTES: Route[] = [
  home,
  itemsList,
  itemsGet,
  authorsGet,
  itemsCreate,
  itemsMedia,
  itemsListing,
  versionsBegin,
  versionsSignParts,
  versionsParts,
  versionsComplete,
  versionsAbort,
  versionsWithdraw,
  versionsSubmit,
  versionsDelete,
  download,
  itemsPack,
  ratingPut,
  ratingDelete,
  myPublications,
  reviewQueue,
  reviewUnsubmitted,
  reviewDecide,
  reviewPack,
  itemsUnlist,
  itemsRelist,
  homeFeatured,
  itemsFeature,
  itemsUnfeature,
  homeWelcome,
  usersBan,
  jobsDaily,
];

const ROUTES: Route[] = [...accountRoutes(STORE_SITE).filter((route) => !isSanctuaryOnly(route)), ...STORE_OWN_ROUTES];

export { ROUTES, STORE_OWN_ROUTES };
