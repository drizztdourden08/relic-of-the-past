/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { FeaturedResponse } from '@rotp/hub-contracts';
import { featuredSchema } from '@rotp/hub-contracts';
import { badRequest } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { saveFeatured } from '../home/save-featured';

const homeFeatured: Route = {
  ...STORE_ROUTES.homeFeatured,
  handler: async ({ req, res }) => {
    const player = await requirePermission(req, 'feature');
    const { itemIds } = parseBody(featuredSchema, req.body);
    const items = await itemsRepo.getMany(itemIds);
    const unusable = itemIds.filter((id) => !items.some((item) => item.id === id && item.status === 'published'));
    if (unusable.length > 0) throw badRequest(`Only published items can be featured: ${unusable.join(', ')}.`);

    await saveFeatured(itemIds, personOf(player));
    const body: FeaturedResponse = { itemIds };
    res.status(200).json(body);
  },
};

export { homeFeatured };
