/* @layer store-api @kind logic */
import { STORE_ROUTES, versionCompleteSchema } from '@rotp/hub-contracts';
import { badRequest, conflict, parseBody } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { itemsRepo } from '../db/items-repo';
import { loadUploadingVersion, sendSignedItem } from '../items/version-routes';
import { dropVersion, replaceVersion, versionOf } from '../items/versions';
import { statusAfter } from '../items/item-status';
import { verifyVersion } from '../items/verify-version';
import type { VerifiedVersion } from '../items/verify-version.type';
import { storeBucket } from '../storage/store-bucket';

const versionsComplete: Route = {
  ...STORE_ROUTES.versionsComplete,
  handler: async (ctx) => {
    const { item, version, upload } = await loadUploadingVersion(ctx);
    const { etags } = parseBody(versionCompleteSchema, ctx.req.body);
    if (etags.length !== upload.parts) throw badRequest(`Expected ${upload.parts} ETags.`);
    await storeBucket.complete(version.key, upload.multipartId, etags);

    let verified: VerifiedVersion;
    try {
      verified = await verifyVersion(item, version);
    } catch (err) {
      await storeBucket.remove(version.key).catch(() => undefined);
      await itemsRepo.mutate(item.id, (latest) => ({ versions: dropVersion(latest, version.n) }));
      throw err;
    }

    const updated = await itemsRepo.mutate(item.id, (latest) => {
      const entry = versionOf(latest, version.n);
      if (entry?.review.state !== 'uploading') throw conflict('This version is not being uploaded.');
      const ready = {
        ...entry,
        status: 'ready' as const,
        upload: null,
        bytes: verified.bytes,
        sha256: verified.sha256,
        facts: verified.facts,
        review: { ...entry.review, state: 'ready' as const },
      };
      const versions = replaceVersion(latest, ready);
      return { versions, status: statusAfter({ ...latest, versions }) };
    });
    await sendSignedItem(ctx, updated);
  },
};

export { versionsComplete };
