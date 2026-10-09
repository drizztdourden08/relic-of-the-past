/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadVisibleItem } from '../items/item-guards';
import { moveVersion } from '../items/move-version';
import { actorsOf } from '../items/project-item';
import { requireStep } from '../items/version-guard';
import { loadVersion } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';
import { signItem } from '../media/sign-media';

const versionsAbort: Route = {
  ...STORE_ROUTES.versionsAbort,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const actors = actorsOf(item, player);
    const version = loadVersion(item, params.n);
    requireStep(version, 'abort', actors);
    if (version.upload) await storeBucket.abort(version.key, version.upload.multipartId).catch(() => undefined);
    const removal = { at: now(), reason: 'deleted' as const, by: personOf(player) };
    const updated = await itemsRepo.mutate(item.id, (latest) => moveVersion(latest, {
      n: version.n,
      action: 'abort',
      actors,
      reshape: (entry, to) => ({ ...entry, upload: null, review: { ...entry.review, state: to }, removed: removal }),
    }));
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsAbort };
