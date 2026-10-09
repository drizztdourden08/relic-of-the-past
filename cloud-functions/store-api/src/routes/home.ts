/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { HomeResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
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
