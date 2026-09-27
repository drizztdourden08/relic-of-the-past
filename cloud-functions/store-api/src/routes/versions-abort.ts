/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/abort. The author gives up an upload in progress: the
 *  multipart upload is cancelled and the entry removed, so the next version can start. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemChangeResponse } from '../../../../shared/store/api-types';
import { conflict } from '../../../hub-core/http/http-error';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { dropVersion, loadVersion, versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';
import { signItem } from '../media/sign-media';

const versionsAbort: Route = {
  ...STORE_ROUTES.versionsAbort,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (version.review.state !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    await storeBucket.abort(version.key, version.upload.multipartId).catch(() => undefined);
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      if (versionOf(latest, version.n)?.review.state !== 'uploading') throw conflict('This version is not being uploaded.');
      return { versions: dropVersion(latest, version.n) };
    });
    const body: ItemChangeResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsAbort };
