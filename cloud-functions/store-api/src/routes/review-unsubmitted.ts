/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { UnsubmittedResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
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
