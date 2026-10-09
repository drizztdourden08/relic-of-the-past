/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { PackLinkResponse } from '@rotp/hub-contracts';
import { HUB_LIMITS } from '@rotp/hub-contracts';
import { isPackKey } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { conflict, notFound, tooMany } from '../../../hub-core/http/http-error';
import { rateLimitRepo } from '../../../hub-core/db/rate-limit-repo';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { DAY_MS } from '../db/daily-repo.constants';
import { loadVisibleItem } from '../items/item-guards';
import { versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';
import { OVER_CAP } from './items-pack.constants';

const livePack = (item: StoreItem): StoreVersion & { packKey: string } => {
  const version = item.liveVersion === null ? null : versionOf(item, item.liveVersion);
  if (!version) throw notFound('This item has no approved version yet, so there is nothing to show.');
  if (version.review.state !== 'approved' || !version.packKey || !isPackKey(version.packKey)) {
    throw notFound('The live version has no approved pack to show.');
  }
  if (version.removed) throw conflict(`The file of ${version.semver} was removed, so there is nothing to show.`);
  return { ...version, packKey: version.packKey };
};

const itemsPack: Route = {
  ...STORE_ROUTES.itemsPack,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const version = livePack(await loadVisibleItem(params.id, player));
    const key = `store-pack-previews-${player.caller.userId}`;
    if (!(await rateLimitRepo.checkRateLimit(key, STORE_LIMITS.packPreviewsPerDay, DAY_MS))) throw tooMany(OVER_CAP);
    const url = await storeBucket.signPreview(version.packKey, version.contentType);
    const body: PackLinkResponse = {
      url,
      bytes: version.bytes,
      container: version.container,
      expiresAt: Date.now() + HUB_LIMITS.previewUrlSeconds * 1000,
    };
    res.status(200).json(body);
  },
};

export { itemsPack };
