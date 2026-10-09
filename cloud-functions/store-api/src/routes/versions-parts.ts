/* @layer store-api @kind logic */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { UploadedPartsResponse } from '../../../../shared/store/api-types';
import { conflict } from '../../../hub-core/http/http-error';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { loadOwnItem } from '../items/item-guards';
import { loadVersion } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const versionsParts: Route = {
  ...STORE_ROUTES.versionsParts,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (version.review.state !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const body: UploadedPartsResponse = { parts: await storeBucket.listParts(version.key, version.upload.multipartId) };
    res.status(200).json(body);
  },
};

export { versionsParts };
