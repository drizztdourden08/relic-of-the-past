/* @layer store-api @kind logic */
/** POST /items/:id/download { version? }. Holds the player to the daily download count and
 *  byte cap, records the install, and answers a presigned GET of the live version (or the
 *  approved version asked for) with its checksum and container. Only keys under packs/ are
 *  ever signed here, so nothing unreviewed can leave through this route. An approved version
 *  whose file was pruned is refused with the reason. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { DownloadResponse } from '../../../../shared/store/api-types';
import { HUB_LIMITS } from '../../../../shared/hub/limits';
import { isPackKey, packName } from '../../../../shared/store/keys';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import { downloadSchema } from '../../../../shared/store/schemas';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import { notFound, tooMany } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import { rateLimitRepo } from '../../../hub-core/db/rate-limit-repo';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { DAY_MS } from '../db/daily-repo';
import { quotaRepo } from '../db/quota-repo';
import { loadVisibleItem } from '../items/item-guards';
import { isAuthor } from '../items/project-item';
import { recordInstall } from '../items/record-install';
import { versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const approvedVersion = (item: StoreItem, requested: number | undefined): StoreVersion & { packKey: string } => {
  const n = requested ?? item.liveVersion;
  const version = n === null ? null : versionOf(item, n);
  if (!version || version.review.state !== 'approved' || !version.packKey || !isPackKey(version.packKey)) {
    throw notFound('That version is not available.');
  }
  if (version.removed) {
    throw notFound(`The file of ${version.semver} was removed. The store keeps the newest ${STORE_LIMITS.filesKept[item.kind]} versions of a ${item.kind} pack; install the live version.`);
  }
  return { ...version, packKey: version.packKey };
};

const download: Route = {
  ...STORE_ROUTES.download,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadVisibleItem(params.id, player);
    const version = approvedVersion(item, parseBody(downloadSchema, req.body).version);
    const userId = player.caller.userId;
    const at = now();
    if (!(await rateLimitRepo.checkRateLimit(`store-downloads-${userId}`, STORE_LIMITS.downloadsPerDay, DAY_MS))) {
      throw tooMany('That is the most downloads for one day. Try again tomorrow.');
    }
    if (!(await quotaRepo.spendBytes(userId, version.bytes, STORE_LIMITS.downloadBytesPerDay, at))) {
      throw tooMany('That is the most data for one day. Try again tomorrow.');
    }
    await recordInstall({ itemId: item.id, userId, version: version.n, isAuthor: isAuthor(item, player), at });
    const url = await storeBucket.signDownload(version.packKey, packName(item, version));
    const body: DownloadResponse = {
      url,
      expiresInSeconds: HUB_LIMITS.downloadUrlSeconds,
      itemId: item.id,
      kind: item.kind,
      name: item.name,
      version: version.n,
      semver: version.semver,
      container: version.container,
      bytes: version.bytes,
      sha256: version.sha256 ?? '',
    };
    res.status(200).json(body);
  },
};

export { download };
