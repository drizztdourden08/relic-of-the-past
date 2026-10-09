/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import { isInFlight } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadVisibleItem } from '../items/item-guards';
import { moveVersion } from '../items/move-version';
import { actorsOf } from '../items/project-item';
import { loadVersion } from '../items/versions';
import { signItem } from '../media/sign-media';

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
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const actors = actorsOf(item, player);
    const { n } = loadVersion(item, params.n);
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
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsSubmit };
