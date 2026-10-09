/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { VersionCompleteResponse } from '@rotp/hub-contracts';
import { versionCompleteSchema } from '@rotp/hub-contracts';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { dropVersion, loadVersion, replaceVersion, versionOf } from '../items/versions';
import { statusAfter } from '../items/item-status';
import { verifyVersion } from '../items/verify-version';
import type { VerifiedVersion } from '../items/verify-version.type';
import { storeBucket } from '../storage/store-bucket';
import { signItem } from '../media/sign-media';

const versionsComplete: Route = {
  ...STORE_ROUTES.versionsComplete,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const version = loadVersion(item, params.n);
    if (version.review.state !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { etags } = parseBody(versionCompleteSchema, req.body);
    if (etags.length !== version.upload.parts) throw badRequest(`Expected ${version.upload.parts} ETags.`);
    await storeBucket.complete(version.key, version.upload.multipartId, etags);

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
      if (!entry || entry.review.state !== 'uploading') throw conflict('This version is not being uploaded.');
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
    const body: VersionCompleteResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsComplete };
