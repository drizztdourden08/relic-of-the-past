/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
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
