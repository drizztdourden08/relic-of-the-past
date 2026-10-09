/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { PackLinkResponse } from '@rotp/hub-contracts';
import { HUB_LIMITS } from '@rotp/hub-contracts';
import type { StoreVersion } from '@rotp/hub-contracts';
import { badRequest, conflict, notFound } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePermission } from '../auth/player';
import { loadItem } from '../items/item-guards';
import { versionOf } from '../items/versions';
import { parseTarget } from '../review/queue-of';
import { storeBucket } from '../storage/store-bucket';

const readableKey = (version: StoreVersion): string => {
  if (version.removed) throw conflict(`The file of ${version.semver} was removed, so there is nothing to read.`);
  if (version.status === 'uploading' || version.review.state === 'uploading') {
    throw conflict(`${version.semver} is still uploading. Open it again once the upload is done.`);
  }
  return version.review.state === 'approved' && version.packKey ? version.packKey : version.key;
};

const reviewPack: Route = {
  ...STORE_ROUTES.reviewPack,
  handler: async ({ req, res, params }) => {
    await requirePermission(req, 'review');
    const item = await loadItem(params.itemId);
    const target = parseTarget(params.target);
    if (target.kind !== 'version') throw badRequest('Only a version has a pack to read.');
    const version = versionOf(item, target.n);
    if (!version) throw notFound('No such version.');
    const url = await storeBucket.signPreview(readableKey(version), version.contentType);
    const body: PackLinkResponse = {
      url,
      bytes: version.bytes,
      container: version.container,
      expiresAt: Date.now() + HUB_LIMITS.previewUrlSeconds * 1000,
    };
    res.status(200).json(body);
  },
};

export { reviewPack };
