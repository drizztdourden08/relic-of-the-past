/* @layer store-api @kind logic */
/** GET /home. The welcome message and the four shelves, built from indexed queries and
 *  served from memory for five minutes. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { HomeResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { cachedHome } from '../home/home-cache';

const home: Route = {
  ...STORE_ROUTES.home,
  handler: async ({ req, res }) => {
    await requirePlayer(req);
    const body: HomeResponse = await cachedHome();
    res.status(200).json(body);
  },
};

export { home };
