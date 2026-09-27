/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/withdraw. The author pulls a waiting version out of the
 *  queue. The entry stays in the history as withdrawn; its upload is removed, since nobody
 *  can approve it any more. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { conflict } from '../../../hub-core/http/http-error';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { statusAfter } from '../items/item-status';
import { loadVersion, replaceVersion, versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';
import { signItem } from '../media/sign-media';

const NOT_WAITING = 'This version is not waiting for review.';

const versionsWithdraw: Route = {
  ...STORE_ROUTES.versionsWithdraw,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (version.review.state !== 'waiting') throw conflict(NOT_WAITING);
    const at = now();
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      const entry = versionOf(latest, version.n);
      if (entry?.review.state !== 'waiting') throw conflict(NOT_WAITING);
      const versions = replaceVersion(latest, { ...entry, review: { ...entry.review, state: 'withdrawn', decidedAt: at } });
      return { versions, status: statusAfter({ ...latest, versions }) };
    });
    await storeBucket.remove(version.key).catch(() => undefined);
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsWithdraw };
