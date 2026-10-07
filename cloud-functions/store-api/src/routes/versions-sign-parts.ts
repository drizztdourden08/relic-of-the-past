/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/parts { parts: [n..m], partsDone? }. Presigned PUT URLs for a
 *  batch of the version's parts, for its author only, while it uploads. `partsDone` is how
 *  many parts the uploader already has up; the entry keeps it with the time of the ask. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { SignPartsResponse } from '../../../../shared/store/api-types';
import { signPartsSchema } from '../../../../shared/store/schemas';
import type { StoreVersion } from '../../../../shared/store/types';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { loadVersion, replaceVersion, versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const isUploading = (version: StoreVersion | null): version is StoreVersion =>
  version !== null && version.review.state === 'uploading' && version.upload !== null;

/** Records the uploader's count on the entry, while the version is still uploading. */
const recordPartsDone = (itemId: string, n: number, partsDone: number) =>
  itemsRepo.mutate(itemId, (latest) => {
    const version = versionOf(latest, n);
    if (!isUploading(version) || !version.upload) return {};
    const upload = { ...version.upload, partsDone: Math.min(partsDone, version.upload.parts), updatedAt: now() };
    return { versions: replaceVersion(latest, { ...version, upload }) };
  });

const versionsSignParts: Route = {
  ...STORE_ROUTES.versionsSignParts,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (!isUploading(version) || !version.upload) throw conflict('This version is not being uploaded.');
    const { parts, partsDone } = parseBody(signPartsSchema, req.body);
    const { multipartId, parts: total } = version.upload;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    if (partsDone !== undefined) await recordPartsDone(item.id, version.n, partsDone);
    const urls = await Promise.all(parts.map(async (part) => ({ part, url: await storeBucket.signPart(version.key, multipartId, part) })));
    const body: SignPartsResponse = { urls };
    res.status(200).json(body);
  },
};

export { versionsSignParts };
