/* @layer store-api @kind logic */
/** POST /items/:id/media { role, bytes, sha256 }. A presigned PUT for the author's card or
 *  banner, under a key named by the picture's hash, so a pending edit never replaces the
 *  live picture. The signed length binds the upload to the declared size, which the schema
 *  holds to the role's cap; the listing route checks the object once it arrived. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { MediaUploadResponse } from '../../../../shared/store/api-types';
import { HUB_LIMITS } from '../../../../shared/hub/limits';
import { STORE_KEYS } from '../../../../shared/store/keys';
import { mediaUploadSchema } from '../../../../shared/store/schemas';
import { parseBody } from '../../../hub-core/http/parse-body';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { loadOwnItem } from '../items/item-guards';
import { storeBucket } from '../storage/store-bucket';

const SHA_PREFIX_CHARS = 8;

const itemsMedia: Route = {
  ...STORE_ROUTES.itemsMedia,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const { role, bytes, sha256 } = parseBody(mediaUploadSchema, req.body);
    const key = STORE_KEYS.media(item.id, role, sha256.slice(0, SHA_PREFIX_CHARS));
    const url = await storeBucket.signPut(key, bytes, 'image/webp');
    const body: MediaUploadResponse = { key, url, expiresInSeconds: HUB_LIMITS.partUrlSeconds };
    res.status(200).json(body);
  },
};

export { itemsMedia };
