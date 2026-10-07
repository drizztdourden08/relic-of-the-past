/* @layer store-api @kind logic */
/** GET /review/:itemId/:target/pack. For anyone holding the store's review permission, an
 *  inline signed link to a version's pack (`v<n>`), so the review page reads it in parts
 *  without downloading it: the file under packs/ once approved, else the upload under
 *  incoming/. The link lives as long as a preview link. A version still uploading, or whose
 *  file was removed, is refused with the reason. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { PackLinkResponse } from '../../../../shared/store/api-types';
import { HUB_LIMITS } from '../../../../shared/hub/limits';
import type { StoreVersion } from '../../../../shared/store/types';
import { badRequest, conflict, notFound } from '../../../hub-core/http/http-error';
import type { Route } from '../../../hub-core/route.type';
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
