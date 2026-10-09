/* @layer store-api @kind logic */
import { STORE_ROUTES, ratingSchema } from '@rotp/hub-contracts';
import type { RatingResponse } from '@rotp/hub-contracts';
import { parseBody } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { rate } from '../ratings/rate';

const ratingPut: Route = {
  ...STORE_ROUTES.ratingPut,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const { stars } = parseBody(ratingSchema, req.body);
    const body: RatingResponse = await rate(params.id, player, stars);
    res.status(200).json(body);
  },
};

export { ratingPut };
