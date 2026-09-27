/* @layer store-api @kind logic */
/** POST /review/:itemId/:target { decision, note }. A reviewer decides a waiting version
 *  (`v<n>`) or listing edit (its id). Approving a version moves its pack to packs/ and makes
 *  it live; approving an edit applies it. A rejection needs a note. Nobody but an admin
 *  decides on their own item. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { reviewDecideSchema } from '../../../../shared/store/schemas';
import type { ReviewDecideBody } from '../../../../shared/store/schemas';
import type { ReviewTarget } from '../../../../shared/store/api-types';
import type { StoreItem } from '../../../../shared/store/types';
import { forbidden } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadItem } from '../items/item-guards';
import { isAuthor } from '../items/project-item';
import { markEditApproved, markEditRejected, markVersionRejected, waitingVersion } from '../items/mark-decided';
import type { Decided } from '../items/mark-decided';
import { approveVersion } from '../items/promote-version';
import { invalidateHome } from '../home/home-cache';
import { signItem } from '../media/sign-media';
import { parseTarget } from '../review/queue-of';

const decide = async (item: StoreItem, target: ReviewTarget, { decision }: ReviewDecideBody, decided: Decided): Promise<StoreItem> => {
  if (target.kind === 'version') {
    const version = waitingVersion(item, target.n);
    return decision === 'approve'
      ? approveVersion(item, version, decided)
      : itemsRepo.mutate(item.id, (latest) => markVersionRejected(latest, target.n, decided));
  }
  return itemsRepo.mutate(item.id, (latest) => (decision === 'approve'
    ? markEditApproved(latest, target.editId, decided)
    : markEditRejected(latest, target.editId, decided)));
};

const reviewDecide: Route = {
  ...STORE_ROUTES.reviewDecide,
  handler: async ({ req, res, params }) => {
    const reviewer = await requirePermission(req, 'review');
    const item = await loadItem(params.itemId);
    if (isAuthor(item, reviewer) && !reviewer.rights.admin) throw forbidden('Another reviewer decides on your own item.');
    const body = parseBody(reviewDecideSchema, req.body);
    const decided: Decided = { by: personOf(reviewer), note: body.note, at: now() };
    const updated = await decide(item, parseTarget(params.target), body, decided);
    invalidateHome();
    const response: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(response);
  },
};

export { reviewDecide };
