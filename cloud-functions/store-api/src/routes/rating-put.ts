/* @layer store-api @kind logic */
/** PUT /items/:id/rating { stars }. Sets or changes the caller's one rating of an item they
 *  installed and did not write; the item's totals move in the same transaction. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { RatingResponse } from '../../../../shared/store/api-types';
import { ratingSchema } from '../../../../shared/store/schemas';
import { parseBody } from '../../../hub-core/http/parse-body';
import type { Route } from '../../../hub-core/route.type';
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
