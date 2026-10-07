/* @layer store-api @kind logic */
/** POST /review/:itemId/:target { decision, note }. A reviewer decides a version (`v<n>`)
 *  or a waiting listing edit (its id). A waiting version can be approved or rejected, a ready
 *  one only rejected. Approving a version moves its pack to packs/, makes it live and prunes
 *  the item's older files; approving an edit applies it. A rejection keeps the upload for the
 *  author to resubmit, and needs a note. Nobody but an admin decides on their own item. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { reviewDecideSchema } from '../../../../shared/store/schemas';
import type { ReviewDecideBody } from '../../../../shared/store/schemas';
import type { ReviewTarget } from '../../../../shared/store/api-types';
import type { StoreItem } from '../../../../shared/store/types';
import type { Actor } from '../../../../shared/store/version-flow';
import { forbidden } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadItem } from '../items/item-guards';
import { isAuthor } from '../items/project-item';
import { markEditApproved, markEditRejected, markVersionRejected, versionToDecide } from '../items/mark-decided';
import { requireStep } from '../items/version-guard';
import type { Decided } from '../items/mark-decided';
import { approveVersion } from '../items/promote-version';
import { invalidateHome } from '../home/home-cache';
import { signItem } from '../media/sign-media';
import { parseTarget } from '../review/queue-of';

const REVIEWER: readonly Actor[] = ['reviewer'];

const decide = async (item: StoreItem, target: ReviewTarget, { decision }: ReviewDecideBody, decided: Decided): Promise<StoreItem> => {
  if (target.kind === 'version') {
    const version = versionToDecide(item, target.n);
    requireStep(version, decision, REVIEWER);
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
