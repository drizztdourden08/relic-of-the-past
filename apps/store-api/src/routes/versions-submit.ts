/* @layer store-api @kind logic */
import { STORE_ROUTES, isInFlight } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import { conflict, now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { moveVersion } from '../items/move-version';
import { loadVersionTarget, sendSignedItem } from '../items/version-routes';

const requireRoomFor = (item: StoreItem, n: number): void => {
  if (item.versions.some((version) => version.n !== n && isInFlight(version))) {
    throw conflict('Another version of this item is uploading, ready or waiting. Finish or delete it first.');
  }
  if (item.versions.some((version) => version.n > n && version.review.state === 'approved')) {
    throw conflict('A newer version is already approved, so this one cannot go back to review.');
  }
};

const versionsSubmit: Route = {
  ...STORE_ROUTES.versionsSubmit,
  handler: async (ctx) => {
    const { item, actors, n } = await loadVersionTarget(ctx);
    const at = now();
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      requireRoomFor(latest, n);
      return moveVersion(latest, {
        n,
        action: 'submit',
        actors,
        reshape: (version, to) => ({ ...version, review: { state: to, submittedAt: at, decidedAt: null, by: null, note: '' } }),
      });
    });
    await sendSignedItem(ctx, updated);
  },
};

export { versionsSubmit };
