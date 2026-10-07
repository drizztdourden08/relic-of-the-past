/* @layer store-api @kind logic */
/** DELETE /items/:id/feature. Anyone holding the store's feature permission takes an item
 *  out of the home page's featured row, from the item's own page. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { settingsRepo } from '../db/settings-repo';
import { saveFeatured } from '../home/save-featured';
import { loadItem } from '../items/item-guards';
import { signItem } from '../media/sign-media';

const itemsUnfeature: Route = {
  ...STORE_ROUTES.itemsUnfeature,
  handler: async ({ req, res, params }) => {
    const player = await requirePermission(req, 'feature');
    const item = await loadItem(params.id);
    const ids = await settingsRepo.getFeatured();
    if (ids.includes(item.id)) await saveFeatured(ids.filter((id) => id !== item.id), personOf(player));
    const body: ItemChangeResponse = { item: await signItem(await loadItem(item.id)) };
    res.status(200).json(body);
  },
};

export { itemsUnfeature };
