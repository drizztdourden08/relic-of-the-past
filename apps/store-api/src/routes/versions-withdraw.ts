/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { moveVersion } from '../items/move-version';
import { loadVersionTarget, sendSignedItem } from '../items/version-routes';

const versionsWithdraw: Route = {
  ...STORE_ROUTES.versionsWithdraw,
  handler: async (ctx) => {
    const { item, actors, n } = await loadVersionTarget(ctx);
    const updated = await itemsRepo.mutate(item.id, (latest) => moveVersion(latest, {
      n,
      action: 'withdraw',
      actors,
      reshape: (version, to) => ({ ...version, review: { ...version.review, state: to, submittedAt: null } }),
    }));
    await sendSignedItem(ctx, updated);
  },
};

export { versionsWithdraw };
