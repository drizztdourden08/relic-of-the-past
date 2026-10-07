/* @layer root-config @kind logic */
/** DELETE /files/:id. Soft-deletes the record and removes the object of every
 *  version, aborting the multipart upload of any version that never finished.
 *  Owner or admin. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { FileVersion, SanctuaryFile } from '../../../../shared/sanctuary';
import { requireAccess } from '../auth/require-access';
import { assertOwnerOrAdmin, loadVisibleFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { b2 } from '../storage/b2';
import type { Route } from '../route.type';

/** A first upload carries its multipart id on the file and on its version 1. */
const dropVersion = async (file: SanctuaryFile, version: FileVersion): Promise<void> => {
  const upload = version.upload ?? (version.n === file.currentVersion ? file.upload : null);
  if (version.status === 'uploading' || file.status === 'uploading') {
    if (upload) await b2.abort(version.key, upload.multipartId).catch(() => undefined);
    return;
  }
  await b2.remove(version.key);
};

const filesDelete: Route = {
  ...SANCTUARY_ROUTES.filesDelete,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    assertOwnerOrAdmin(file, member);
    await Promise.all(file.versions.map((version) => dropVersion(file, version)));
    await filesRepo.update(file.id, { status: 'deleted', upload: null });
    res.status(200).json({ ok: true });
  },
};

export { filesDelete };
