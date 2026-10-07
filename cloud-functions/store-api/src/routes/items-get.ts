/* @layer store-api @kind logic */
/** GET /items/:id. The item as this caller may see it, with their own rating and whether
 *  they installed it. An item they may not see answers as missing. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { ratingsRepo } from '../db/ratings-repo';
import { installsRepo } from '../db/installs-repo';
import { loadVisibleItem } from '../items/item-guards';
import { projectItem } from '../items/project-item';
import { signItem } from '../media/sign-media';

const itemsGet: Route = {
  ...STORE_ROUTES.itemsGet,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const userId = player.caller.userId;
    const [myRating, installed, signed] = await Promise.all([
      ratingsRepo.starsOf(item.id, userId),
      installsRepo.hasInstalled(item.id, userId),
      signItem(projectItem(item, player)),
    ]);
    const body: ItemResponse = { item: signed, myRating, installed };
    res.status(200).json(body);
  },
};

export { itemsGet };
