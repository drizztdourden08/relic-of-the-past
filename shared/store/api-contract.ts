/* @layer shared-store @kind data */
import type { RouteDef } from '../hub/api-contract';

const STORE_ROUTES = {
  home: { method: 'GET', path: '/home' },
  itemsList: { method: 'GET', path: '/items' },
  itemsGet: { method: 'GET', path: '/items/:id' },
  authorsGet: { method: 'GET', path: '/authors/:userId' },

  itemsCreate: { method: 'POST', path: '/items' },
  itemsMedia: { method: 'POST', path: '/items/:id/media' },
  itemsListing: { method: 'POST', path: '/items/:id/listing' },
  versionsBegin: { method: 'POST', path: '/items/:id/versions' },
  versionsSignParts: { method: 'POST', path: '/items/:id/versions/:n/parts' },
  versionsParts: { method: 'GET', path: '/items/:id/versions/:n/parts' },
  versionsComplete: { method: 'POST', path: '/items/:id/versions/:n/complete' },
  versionsAbort: { method: 'POST', path: '/items/:id/versions/:n/abort' },
  versionsWithdraw: { method: 'POST', path: '/items/:id/versions/:n/withdraw' },
  versionsSubmit: { method: 'POST', path: '/items/:id/versions/:n/submit' },
  versionsDelete: { method: 'DELETE', path: '/items/:id/versions/:n' },

  download: { method: 'POST', path: '/items/:id/download' },
  itemsPack: { method: 'GET', path: '/items/:id/pack' },
  ratingPut: { method: 'PUT', path: '/items/:id/rating' },
  ratingDelete: { method: 'DELETE', path: '/items/:id/rating' },

  myPublications: { method: 'GET', path: '/me/publications' },

  reviewQueue: { method: 'GET', path: '/review' },
  reviewUnsubmitted: { method: 'GET', path: '/review/unsubmitted' },
  reviewDecide: { method: 'POST', path: '/review/:itemId/:target' },
  reviewPack: { method: 'GET', path: '/review/:itemId/:target/pack' },
  itemsUnlist: { method: 'POST', path: '/items/:id/unlist' },
  itemsRelist: { method: 'POST', path: '/items/:id/relist' },
  homeFeatured: { method: 'PUT', path: '/home/featured' },
  itemsFeature: { method: 'POST', path: '/items/:id/feature' },
  itemsUnfeature: { method: 'DELETE', path: '/items/:id/feature' },
  homeWelcome: { method: 'PUT', path: '/home/welcome' },
  usersBan: { method: 'POST', path: '/users/:userId/ban' },

  jobsDaily: { method: 'POST', path: '/jobs/daily' },
} as const satisfies Record<string, RouteDef>;

export { STORE_ROUTES };
export type { StoreRoute } from './api-contract.type';
