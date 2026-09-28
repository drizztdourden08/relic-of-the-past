/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/withdraw. The author pulls a waiting version out of the
 *  queue. It goes back to ready and keeps its upload, so the author can send it again. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadVisibleItem } from '../items/item-guards';
import { moveVersion } from '../items/move-version';
import { actorsOf } from '../items/project-item';
import { loadVersion } from '../items/versions';
import { signItem } from '../media/sign-media';

const versionsWithdraw: Route = {
  ...STORE_ROUTES.versionsWithdraw,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const actors = actorsOf(item, player);
    const { n } = loadVersion(item, params.n);
    const updated = await itemsRepo.mutate(item.id, (latest) => moveVersion(latest, {
      n,
      action: 'withdraw',
      actors,
      reshape: (version, to) => ({ ...version, review: { ...version.review, state: to, submittedAt: null } }),
    }));
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsWithdraw };
