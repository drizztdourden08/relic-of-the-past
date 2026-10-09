/* @layer store-api @kind logic */
import { http } from '@google-cloud/functions-framework';
import { createRouter } from '../../hub-core/router';
import { STORE_SITE } from './site.constants';
import { ROUTES } from './route-table';

http('storeApi', createRouter(ROUTES, {
  origins: () => [STORE_SITE.origin()],
  prefix: '/api',
}));
