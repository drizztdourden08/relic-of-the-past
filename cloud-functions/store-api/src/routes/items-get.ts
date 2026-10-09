/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
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
