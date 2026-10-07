/* @layer store-api @kind logic */
/** DELETE /items/:id/versions/:n. The author deletes a ready, waiting or rejected version; a
 *  reviewer can also delete an approved one. The file leaves the bucket and the row stays as
 *  deleted, stamped with who and when. A deleted version never comes back; the next upload
 *  is a new version. Deleting the live version hands installs to the newest approved one
 *  left, or unpublishes the item when none is. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { invalidateHome } from '../home/home-cache';
import { loadVisibleItem } from '../items/item-guards';
import { moveVersion } from '../items/move-version';
import { actorsOf } from '../items/project-item';
import { removeFile } from '../items/remove-file';
import { loadVersion, versionOf } from '../items/versions';
import { signItem } from '../media/sign-media';

const versionsDelete: Route = {
  ...STORE_ROUTES.versionsDelete,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const actors = actorsOf(item, player);
    const { n } = loadVersion(item, params.n);
    const removal = { at: now(), reason: 'deleted' as const, by: personOf(player) };
    const updated = await itemsRepo.mutate(item.id, (latest) => moveVersion(latest, {
      n,
      action: 'delete',
      actors,
      reshape: (version, to) => ({ ...version, review: { ...version.review, state: to }, removed: removal }),
    }));
    const deleted = versionOf(updated, n);
    if (deleted) await removeFile(deleted);
    if (updated.liveVersion !== item.liveVersion) invalidateHome();
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsDelete };
