/* @layer store-api @kind logic */
/** GET /review. Waiting versions and listing edits, oldest first, for anyone holding the
 *  store's review permission. A version entry carries a short-lived link to its upload. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ReviewQueueResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
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
