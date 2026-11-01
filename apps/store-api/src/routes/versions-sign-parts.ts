/* @layer store-api @kind logic */
import { STORE_ROUTES, signPartsSchema } from '@rotp/hub-contracts';
import type { SignPartsResponse } from '@rotp/hub-contracts';
import { badRequest, parseBody, now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { loadUploadingVersion } from '../items/version-routes';
import { replaceVersion, versionOf } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const recordPartsDone = (itemId: string, n: number, partsDone: number) =>
  itemsRepo.mutate(itemId, (latest) => {
    const version = versionOf(latest, n);
    if (version?.review.state !== 'uploading' || !version.upload) return {};
    const upload = { ...version.upload, partsDone: Math.min(partsDone, version.upload.parts), updatedAt: now() };
    return { versions: replaceVersion(latest, { ...version, upload }) };
  });

const versionsSignParts: Route = {
  ...STORE_ROUTES.versionsSignParts,
  handler: async (ctx) => {
    const { item, version, upload } = await loadUploadingVersion(ctx);
    const { parts, partsDone } = parseBody(signPartsSchema, ctx.req.body);
    if (parts.some((part) => part > upload.parts)) throw badRequest(`This upload has ${upload.parts} parts.`);
    if (partsDone !== undefined) await recordPartsDone(item.id, version.n, partsDone);
    const urls = await Promise.all(
      parts.map(async (part) => ({ part, url: await storeBucket.signPart(version.key, upload.multipartId, part) })),
    );
    const body: SignPartsResponse = { urls };
    ctx.res.status(200).json(body);
  },
};

export { versionsSignParts };
