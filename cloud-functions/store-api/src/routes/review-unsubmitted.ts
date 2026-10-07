/* @layer store-api @kind logic */
/** GET /review/unsubmitted. The ready versions no author has sent for review yet, oldest
 *  upload first, for anyone holding the store's review permission. Each entry carries a
 *  short-lived link to its upload. Ready versions carry no stored flag, so the whole
 *  catalogue is read, as the daily job does. */
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
