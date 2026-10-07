/* @layer root-config @kind logic */
/** POST /files/:id/complete { etags }. Completes the first multipart upload,
 *  HEADs the object against the declared size, and flips the record and its
 *  version 1 to ready. A size mismatch drops the object and marks the record
 *  deleted. */
import { LIMITS, SANCTUARY_ROUTES, completeFileSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { currentVersionOf, replaceVersion } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import { verifyUpload } from '../../../hub-core/storage/verify-upload';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const filesComplete: Route = {
  ...SANCTUARY_ROUTES.filesComplete,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { etags } = parseBody(completeFileSchema, req.body);
    if (etags.length !== file.upload.parts) throw badRequest(`Expected ${file.upload.parts} ETags.`);
    const version = currentVersionOf(file);
    await filesBucket.complete(version.key, file.upload.multipartId, etags);
    try {
      await verifyUpload(filesBucket, version.key, file.bytes, LIMITS.fileBytes);
    } catch (err) {
      await filesRepo.update(file.id, { status: 'deleted', upload: null });
      throw err;
    }
    const versions = replaceVersion(file, { ...version, status: 'ready', upload: null });
    await filesRepo.update(file.id, { status: 'ready', upload: null, versions });
    res.status(200).json({ file: { ...file, status: 'ready', upload: null, versions } });
  },
};

export { filesComplete };
