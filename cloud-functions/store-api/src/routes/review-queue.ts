/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ReviewQueueResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
import { requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { queueOf } from '../review/queue-of';
import { withLinks } from '../review/with-links';

const reviewQueue: Route = {
  ...STORE_ROUTES.reviewQueue,
  handler: async ({ req, res }) => {
    await requirePermission(req, 'review');
    const entries = queueOf(await itemsRepo.awaitingReview());
    const body: ReviewQueueResponse = { entries: await Promise.all(entries.map(withLinks)) };
    res.status(200).json(body);
  },
};

export { reviewQueue };
