/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { MediaUploadResponse } from '@rotp/hub-contracts';
import { HUB_LIMITS } from '@rotp/hub-contracts';
import { STORE_KEYS } from '@rotp/hub-contracts';
import { mediaUploadSchema } from '@rotp/hub-contracts';
import { parseBody } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { loadOwnItem } from '../items/item-guards';
import { storeBucket } from '../storage/store-bucket';
import { SHA_PREFIX_CHARS } from './items-media.constants';

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
