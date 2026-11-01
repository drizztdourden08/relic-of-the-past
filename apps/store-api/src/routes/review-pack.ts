/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { StoreVersion } from '@rotp/hub-contracts';
import { badRequest, conflict, notFound } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { requirePermission } from '../auth/player';
import { loadItem } from '../items/item-guards';
import { packLinkOf } from '../items/version-routes';
import { versionOf } from '../items/versions';
import { parseTarget } from '../review/queue-of';

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
    res.status(200).json(await packLinkOf(readableKey(version), version));
  },
};

export { reviewPack };
