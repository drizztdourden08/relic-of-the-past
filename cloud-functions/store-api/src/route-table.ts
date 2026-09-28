/* @layer store-api @kind logic */
/** The store's route table: hub-core's account routes the store serves (sign-in, me, saved
 *  views, devices), then one handler per STORE_ROUTES entry. Groups and the admin queue stay
 *  on the Sanctuary, where they are managed, so they are left out here. No two patterns
 *  match the same path. */
import { HUB_ROUTES } from '../../../shared/hub/api-contract';
import type { RouteDef } from '../../../shared/hub/api-contract';
import { accountRoutes } from '../../hub-core/routes/account-routes';
import type { Route } from '../../hub-core/route.type';
import { STORE_SITE } from './site';
import { home } from './routes/home';
import { itemsList } from './routes/items-list';
import { itemsGet } from './routes/items-get';
import { authorsGet } from './routes/authors-get';
import { itemsCreate } from './routes/items-create';
import { itemsMedia } from './routes/items-media';
import { itemsListing } from './routes/items-listing';
import { versionsBegin } from './routes/versions-begin';
import { versionsSignParts } from './routes/versions-sign-parts';
import { versionsParts } from './routes/versions-parts';
import { versionsComplete } from './routes/versions-complete';
import { versionsAbort } from './routes/versions-abort';
import { versionsWithdraw } from './routes/versions-withdraw';
import { versionsSubmit } from './routes/versions-submit';
import { versionsDelete } from './routes/versions-delete';
import { download } from './routes/download';
import { ratingPut } from './routes/rating-put';
import { ratingDelete } from './routes/rating-delete';
import { myPublications } from './routes/my-publications';
import { reviewQueue } from './routes/review-queue';
import { reviewUnsubmitted } from './routes/review-unsubmitted';
import { reviewDecide } from './routes/review-decide';
import { itemsUnlist } from './routes/items-unlist';
import { itemsRelist } from './routes/items-relist';
import { homeFeatured } from './routes/home-featured';
import { homeWelcome } from './routes/home-welcome';
import { usersBan } from './routes/users-ban';
import { jobsDaily } from './routes/jobs-daily';

/** Account routes that only the Sanctuary serves. */
const SANCTUARY_ONLY: readonly RouteDef[] = [
  HUB_ROUTES.adminPending,
  HUB_ROUTES.adminSetGroups,
  HUB_ROUTES.adminRevoke,
  HUB_ROUTES.groupsList,
  HUB_ROUTES.discordRoles,
  HUB_ROUTES.groupsCreate,
  HUB_ROUTES.groupsPatch,
  HUB_ROUTES.groupsDelete,
];

const isSanctuaryOnly = (route: Route): boolean =>
  SANCTUARY_ONLY.some((def) => def.method === route.method && def.path === route.path);

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
  ratingPut,
  ratingDelete,
  myPublications,
  reviewQueue,
  reviewUnsubmitted,
  reviewDecide,
  itemsUnlist,
  itemsRelist,
  homeFeatured,
  homeWelcome,
  usersBan,
  jobsDaily,
];

const ROUTES: Route[] = [...accountRoutes(STORE_SITE).filter((route) => !isSanctuaryOnly(route)), ...STORE_OWN_ROUTES];

export { ROUTES, STORE_OWN_ROUTES };
