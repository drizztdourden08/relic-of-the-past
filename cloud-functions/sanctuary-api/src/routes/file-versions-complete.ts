/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/complete { etags }. Completes the version's
 *  multipart upload and HEADs it against the declared size. A good upload
 *  becomes the current version and its facts move to the top of the record; a
 *  size mismatch drops the object and the entry. */
import { LIMITS, SANCTUARY_ROUTES, completeFileSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict, notFound } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { assertUploader, loadVersion, mirrorOf, replaceVersion, versionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import { verifyUpload } from '../../../hub-core/storage/verify-upload';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const fileVersionsComplete: Route = {
  ...SANCTUARY_ROUTES.fileVersionsComplete,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    assertUploader(version, member);
    if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { etags } = parseBody(completeFileSchema, req.body);
    if (etags.length !== version.upload.parts) throw badRequest(`Expected ${version.upload.parts} ETags.`);
    await filesBucket.complete(version.key, version.upload.multipartId, etags);
    try {
      await verifyUpload(filesBucket, version.key, version.bytes, LIMITS.fileBytes);
    } catch (err) {
      await filesRepo.mutate(file.id, (latest) => ({ versions: latest.versions.filter((entry) => entry.n !== version.n) }));
      throw err;
    }
    const updated = await filesRepo.mutate(file.id, (latest) => {
      const entry = versionOf(latest, version.n);
      if (!entry) throw notFound('No such version.');
      const ready = { ...entry, status: 'ready' as const, upload: null };
      return { versions: replaceVersion(latest, ready), currentVersion: ready.n, ...mirrorOf(ready) };
    });
    res.status(200).json({ file: updated });
  },
};

export { fileVersionsComplete };
