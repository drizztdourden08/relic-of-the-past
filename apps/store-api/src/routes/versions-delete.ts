/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import { now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { personOf } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { invalidateHome } from '../home/home-cache';
import { moveVersion } from '../items/move-version';
import { removeFile } from '../items/remove-file';
import { loadVersionTarget, sendSignedItem } from '../items/version-routes';
import { versionOf } from '../items/versions';

const versionsDelete: Route = {
  ...STORE_ROUTES.versionsDelete,
  handler: async (ctx) => {
    const { player, item, actors, n } = await loadVersionTarget(ctx);
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
    await sendSignedItem(ctx, updated);
  },
};

export { versionsDelete };
