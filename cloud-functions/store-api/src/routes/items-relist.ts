/* @layer store-api @kind logic */
/** POST /items/:id/relist. A reviewer brings an unlisted item back to the status its
 *  versions give it. An item whose author is banned from the store stays unlisted. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { conflict } from '../../../hub-core/http/http-error';
import { usersRepo } from '../../../hub-core/db/users-repo';
import type { Route } from '../../../hub-core/route.type';
import { requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadItem } from '../items/item-guards';
import { baseStatus } from '../items/item-status';
import { invalidateHome } from '../home/home-cache';
import { signItem } from '../media/sign-media';

const itemsRelist: Route = {
  ...STORE_ROUTES.itemsRelist,
  handler: async ({ req, res, params }) => {
    await requirePermission(req, 'review');
    const item = await loadItem(params.id);
    const author = await usersRepo.get(item.author.userId);
    if (author?.sites.store?.state === 'revoked') throw conflict('The author is banned from the store.');
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      if (latest.status !== 'unlisted') throw conflict('This item is not unlisted.');
      return { status: baseStatus(latest) };
    });
    invalidateHome();
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { itemsRelist };
