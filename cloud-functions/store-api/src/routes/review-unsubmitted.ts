/* @layer store-api @kind logic */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { UnsubmittedResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { unsubmittedOf } from '../review/unsubmitted-of';
import { withLinks } from '../review/with-links';

const reviewUnsubmitted: Route = {
  ...STORE_ROUTES.reviewUnsubmitted,
  handler: async ({ req, res }) => {
    await requirePermission(req, 'review');
    const entries = unsubmittedOf(await itemsRepo.all());
    const body: UnsubmittedResponse = { entries: await Promise.all(entries.map(withLinks)) };
    res.status(200).json(body);
  },
};

export { reviewUnsubmitted };
