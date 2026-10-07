/* @layer store-api @kind logic */
/** POST /items/:id/unlist. A reviewer hides a published item from the catalogue, the shelves
 *  and downloads. Its packs stay in the bucket, so a relist brings it back as it was. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { conflict } from '../../../hub-core/http/http-error';
import type { Route } from '../../../hub-core/route.type';
import { requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadItem } from '../items/item-guards';
import { invalidateHome } from '../home/home-cache';
import { signItem } from '../media/sign-media';

const itemsUnlist: Route = {
  ...STORE_ROUTES.itemsUnlist,
  handler: async ({ req, res, params }) => {
    await requirePermission(req, 'review');
    const item = await loadItem(params.id);
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      if (latest.status !== 'published') throw conflict('Only a published item can be unlisted.');
      return { status: 'unlisted' };
    });
    invalidateHome();
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { itemsUnlist };
