/* @layer root-config @kind logic */
/** The Sanctuary API: one Gen2 HTTP function behind the site's /api rewrite. The account
 *  routes come from hub-core, bound to the Sanctuary's site config; the files, reports and
 *  sweep routes are its own. */
import { http } from '@google-cloud/functions-framework';
import { createRouter } from '../../hub-core/router';
import { accountRoutes } from '../../hub-core/routes/account-routes';
import { SANCTUARY_SITE } from './site';
import { ROUTES } from './route-table';

http('sanctuaryApi', createRouter([...accountRoutes(SANCTUARY_SITE), ...ROUTES], {
  origins: () => [SANCTUARY_SITE.origin()],
  prefix: '/api',
}));
