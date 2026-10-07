/* @layer store-api @kind logic */
/** GET /me/publications. Every item the caller wrote and every version of each, with the
 *  full review record: state, reviewer, when, and the note. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { PublicationsResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { signItems } from '../media/sign-media';

const myPublications: Route = {
  ...STORE_ROUTES.myPublications,
  handler: async ({ req, res }) => {
    const player = await requirePlayer(req);
    const body: PublicationsResponse = { items: await signItems(await itemsRepo.byAuthor(player.caller.userId)) };
    res.status(200).json(body);
  },
};

export { myPublications };
