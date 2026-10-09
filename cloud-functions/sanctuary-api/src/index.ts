/* @layer root-config @kind logic */
import { http } from '@google-cloud/functions-framework';
import { createRouter } from '../../hub-core/router';
import { accountRoutes } from '../../hub-core/routes/account-routes';
import { SANCTUARY_SITE } from './site';
import { ROUTES } from './route-table';

http('sanctuaryApi', createRouter([...accountRoutes(SANCTUARY_SITE), ...ROUTES], {
  origins: () => [SANCTUARY_SITE.origin()],
  prefix: '/api',
}));
