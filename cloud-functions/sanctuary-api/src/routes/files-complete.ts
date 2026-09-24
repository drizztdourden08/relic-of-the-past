/* @layer root-config @kind logic */
/** POST /files/:id/complete { etags }. Completes the multipart upload, HEADs
 *  the object against the declared size, and flips the record to ready. A
 *  size mismatch drops the object and marks the record deleted. */
import { LIMITS, SANCTUARY_ROUTES, completeFileSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { assertOwner, loadFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { b2, fileKey } from '../storage/b2';
import { verifyUpload } from '../storage/verify-upload';
import type { Route } from '../route.type';

const filesComplete: Route = {
  ...SANCTUARY_ROUTES.filesComplete,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadFile(params.id);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { etags } = parseBody(completeFileSchema, req.body);
    if (etags.length !== file.upload.parts) throw badRequest(`Expected ${file.upload.parts} ETags.`);
    await b2.complete(fileKey(file.id), file.upload.multipartId, etags);
    try {
      await verifyUpload(fileKey(file.id), file.bytes, LIMITS.fileBytes);
    } catch (err) {
      await filesRepo.update(file.id, { status: 'deleted', upload: null });
      throw err;
    }
    await filesRepo.update(file.id, { status: 'ready', upload: null });
    res.status(200).json({ file: { ...file, status: 'ready', upload: null } });
  },
};

export { filesComplete };
