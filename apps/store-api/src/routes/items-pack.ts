/* @layer store-api @kind logic */
import { STORE_ROUTES, isPackKey, STORE_LIMITS } from '@rotp/hub-contracts';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { conflict, notFound, tooMany, rateLimitRepo } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePlayer } from '../auth/player';
import { DAY_MS } from '../db/daily-repo.constants';
import { loadVisibleItem } from '../items/item-guards';
import { packLinkOf } from '../items/version-routes';
import { versionOf } from '../items/versions';
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
    res.status(200).json(await packLinkOf(version.packKey, version));
  },
};

export { itemsPack };
