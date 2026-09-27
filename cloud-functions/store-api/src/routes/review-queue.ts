/* @layer store-api @kind logic */
/** GET /review. Waiting versions and listing edits, oldest first, for anyone holding the
 *  store's review permission. A version entry carries a short-lived link to its upload
 *  under incoming/, the one place such a link is signed. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ReviewEntry, ReviewQueueResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { versionOf } from '../items/versions';
import { signItem } from '../media/sign-media';
import { queueOf } from '../review/queue-of';
import { storeBucket } from '../storage/store-bucket';

const withLinks = async (entry: ReviewEntry): Promise<ReviewEntry> => {
  const item = await signItem(entry.item);
  const version = entry.target.kind === 'version' ? versionOf(entry.item, entry.target.n) : null;
  if (!version) return { ...entry, item };
  return { ...entry, item, downloadUrl: await storeBucket.signDownload(version.key, version.name) };
};

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
