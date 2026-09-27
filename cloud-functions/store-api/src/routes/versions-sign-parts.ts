/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/parts { parts: [n..m] }. Presigned PUT URLs for a batch of
 *  the version's parts, for its author only, while it uploads. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { SignPartsResponse } from '../../../../shared/store/api-types';
import { signPartsSchema } from '../../../../shared/store/schemas';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { loadOwnItem } from '../items/item-guards';
import { loadVersion } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const versionsSignParts: Route = {
  ...STORE_ROUTES.versionsSignParts,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (version.review.state !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { parts } = parseBody(signPartsSchema, req.body);
    const { multipartId, parts: total } = version.upload;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    const urls = await Promise.all(parts.map(async (part) => ({ part, url: await storeBucket.signPart(version.key, multipartId, part) })));
    const body: SignPartsResponse = { urls };
    res.status(200).json(body);
  },
};

export { versionsSignParts };
