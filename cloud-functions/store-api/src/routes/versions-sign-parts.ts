/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { SignPartsResponse } from '@rotp/hub-contracts';
import { signPartsSchema } from '@rotp/hub-contracts';
import type { StoreVersion } from '@rotp/hub-contracts';
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
