/* @layer shared-store @kind data */
/**
 * The store's own routes. The account routes it also serves (sign-in, me, devices, views)
 * are HUB_ROUTES in shared/hub. store-api's router, the store site and the app all read
 * this table, so a route exists in one place.
 */
import { route } from '../hub/api-contract';
import type { RouteDef } from '../hub/api-contract';

const STORE_ROUTES = {
  home: route('GET', '/home'),
  itemsList: route('GET', '/items'),
  itemsGet: route('GET', '/items/:id'),
  authorsGet: route('GET', '/authors/:userId'),

  itemsCreate: route('POST', '/items'),
  itemsMedia: route('POST', '/items/:id/media'),
  itemsListing: route('POST', '/items/:id/listing'),
  versionsBegin: route('POST', '/items/:id/versions'),
  versionsSignParts: route('POST', '/items/:id/versions/:n/parts'),
  versionsParts: route('GET', '/items/:id/versions/:n/parts'),
  versionsComplete: route('POST', '/items/:id/versions/:n/complete'),
  versionsAbort: route('POST', '/items/:id/versions/:n/abort'),
  versionsWithdraw: route('POST', '/items/:id/versions/:n/withdraw'),
  versionsSubmit: route('POST', '/items/:id/versions/:n/submit'),
  versionsDelete: route('DELETE', '/items/:id/versions/:n'),

  download: route('POST', '/items/:id/download'),
  itemsPack: route('GET', '/items/:id/pack'),
  ratingPut: route('PUT', '/items/:id/rating'),
  ratingDelete: route('DELETE', '/items/:id/rating'),

  myPublications: route('GET', '/me/publications'),

  reviewQueue: route('GET', '/review'),
  reviewUnsubmitted: route('GET', '/review/unsubmitted'),
  reviewDecide: route('POST', '/review/:itemId/:target'),
  reviewPack: route('GET', '/review/:itemId/:target/pack'),
  itemsUnlist: route('POST', '/items/:id/unlist'),
  itemsRelist: route('POST', '/items/:id/relist'),
  homeFeatured: route('PUT', '/home/featured'),
  itemsFeature: route('POST', '/items/:id/feature'),
  itemsUnfeature: route('DELETE', '/items/:id/feature'),
  homeWelcome: route('PUT', '/home/welcome'),
  usersBan: route('POST', '/users/:userId/ban'),

  jobsDaily: route('POST', '/jobs/daily'),
} as const satisfies Record<string, RouteDef>;

type StoreRoute = keyof typeof STORE_ROUTES;

export { STORE_ROUTES };
export type { StoreRoute };
