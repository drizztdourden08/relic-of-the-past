/* @layer store-api @kind logic */
/** POST /items/:id/versions/:n/complete { etags }. Completes the multipart upload, then
 *  holds the object to its declared size and the kind's cap, reads its manifest from the
 *  head of the file and hashes it whole. A good upload waits for review with the facts its
 *  manifest gave; any refusal removes the object and the entry, and says why. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { VersionCompleteResponse } from '../../../../shared/store/api-types';
import { versionCompleteSchema } from '../../../../shared/store/schemas';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { dropVersion, loadVersion, replaceVersion, versionOf } from '../items/versions';
import { statusAfter } from '../items/item-status';
import { verifyVersion } from '../items/verify-version';
import type { VerifiedVersion } from '../items/verify-version';
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

    const at = now();
    const updated = await itemsRepo.mutate(item.id, (latest) => {
      const entry = versionOf(latest, version.n);
      if (!entry || entry.review.state !== 'uploading') throw conflict('This version is not being uploaded.');
      const waiting = {
        ...entry,
        status: 'ready' as const,
        upload: null,
        bytes: verified.bytes,
        sha256: verified.sha256,
        facts: verified.facts,
        review: { ...entry.review, state: 'waiting' as const, submittedAt: at },
      };
      const versions = replaceVersion(latest, waiting);
      return { versions, status: statusAfter({ ...latest, versions }) };
    });
    const body: VersionCompleteResponse = { item: await signItem(updated) };
    res.status(200).json(body);
  },
};

export { versionsComplete };
