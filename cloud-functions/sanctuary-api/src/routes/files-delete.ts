/* @layer root-config @kind logic */
/** DELETE /files/:id. Soft-deletes the record and removes the object, or aborts
 *  the multipart upload when the file never finished. Owner or admin. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireAccess } from '../auth/require-access';
import { assertOwnerOrAdmin, loadFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { b2, fileKey } from '../storage/b2';
import type { Route } from '../route.type';

const filesDelete: Route = {
  ...SANCTUARY_ROUTES.filesDelete,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadFile(params.id);
    assertOwnerOrAdmin(file, member);
    if (file.status === 'uploading' && file.upload) {
      await b2.abort(fileKey(file.id), file.upload.multipartId).catch(() => undefined);
    } else {
      await b2.remove(fileKey(file.id));
    }
    await filesRepo.update(file.id, { status: 'deleted', upload: null });
    res.status(200).json({ ok: true });
  },
};

export { filesDelete };
