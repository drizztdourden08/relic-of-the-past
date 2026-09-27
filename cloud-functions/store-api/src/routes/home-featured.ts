/* @layer store-api @kind logic */
/** PUT /home/featured { itemIds }. The featured row, first to last, for anyone holding the
 *  store's feature permission. Every id must name a published item. The order is kept in
 *  store-settings and mirrored onto each item's `featured`, cleared on the ones that left. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { FeaturedResponse } from '../../../../shared/store/api-types';
import { featuredSchema } from '../../../../shared/store/schemas';
import { badRequest } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { settingsRepo } from '../db/settings-repo';
import { invalidateHome } from '../home/home-cache';

const homeFeatured: Route = {
  ...STORE_ROUTES.homeFeatured,
  handler: async ({ req, res }) => {
    const player = await requirePermission(req, 'feature');
    const { itemIds } = parseBody(featuredSchema, req.body);
    const items = await itemsRepo.getMany(itemIds);
    const unusable = itemIds.filter((id) => !items.some((item) => item.id === id && item.status === 'published'));
    if (unusable.length > 0) throw badRequest(`Only published items can be featured: ${unusable.join(', ')}.`);

    const by = personOf(player);
    const at = now();
    const previous = await settingsRepo.getFeatured();
    await settingsRepo.setFeatured({ itemIds, updatedBy: by, updatedAt: at });
    const left = previous.filter((id) => !itemIds.includes(id));
    await Promise.all([
      ...left.map((id) => itemsRepo.setFeatured(id, null).catch(() => undefined)),
      ...itemIds.map((id, rank) => itemsRepo.setFeatured(id, { rank, by, at })),
    ]);
    invalidateHome();
    const body: FeaturedResponse = { itemIds };
    res.status(200).json(body);
  },
};

export { homeFeatured };
