/* @layer store-api @kind logic */
/** POST /items/:id/feature. Anyone holding the store's feature permission adds a published
 *  item to the end of the home page's featured row, from the item's own page. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import { conflict } from '../../../hub-core/http/http-error';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { settingsRepo } from '../db/settings-repo';
import { saveFeatured } from '../home/save-featured';
import { loadItem } from '../items/item-guards';
import { signItem } from '../media/sign-media';

const itemsFeature: Route = {
  ...STORE_ROUTES.itemsFeature,
  handler: async ({ req, res, params }) => {
    const player = await requirePermission(req, 'feature');
    const item = await loadItem(params.id);
    if (item.status !== 'published') throw conflict('Only a published item can be featured.');
    const ids = await settingsRepo.getFeatured();
    if (!ids.includes(item.id)) {
      if (ids.length >= STORE_LIMITS.featuredMax) {
        throw conflict(`The featured row is full (${STORE_LIMITS.featuredMax}). Remove one in Administration first.`);
      }
      await saveFeatured([...ids, item.id], personOf(player));
    }
    const body: ItemChangeResponse = { item: await signItem(await loadItem(item.id)) };
    res.status(200).json(body);
  },
};

export { itemsFeature };
