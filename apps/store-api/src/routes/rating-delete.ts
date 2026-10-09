/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { RatingResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { rate } from '../ratings/rate';

const ratingDelete: Route = {
  ...STORE_ROUTES.ratingDelete,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const body: RatingResponse = await rate(params.id, player, null);
    res.status(200).json(body);
  },
};

export { ratingDelete };
