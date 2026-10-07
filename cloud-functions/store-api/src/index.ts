/* @layer store-api @kind logic */
/** The store API: one Gen2 HTTP function behind the store site's /api rewrite. The account
 *  routes come from hub-core, bound to the store's site config; the catalogue, versions,
 *  review, ratings, home and daily job routes are its own. */
import { http } from '@google-cloud/functions-framework';
import { createRouter } from '../../hub-core/router';
import { STORE_SITE } from './site';
import { ROUTES } from './route-table';

http('storeApi', createRouter(ROUTES, {
  origins: () => [STORE_SITE.origin()],
  prefix: '/api',
}));
