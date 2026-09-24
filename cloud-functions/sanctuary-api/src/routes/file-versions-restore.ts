/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/restore. Owner or admin. Points the file back at
 *  an older version and mirrors its facts to the top of the record; no bytes move. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict, notFound } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { assertOwnerOrAdmin, loadVisibleFile } from '../files/file-guards';
import { loadVersion, mirrorOf, versionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import type { Route } from '../route.type';

const fileVersionsRestore: Route = {
  ...SANCTUARY_ROUTES.fileVersionsRestore,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    assertOwnerOrAdmin(file, member);
    const { n } = loadVersion(file, params.n);
    const updated = await filesRepo.mutate(file.id, (latest) => {
      const entry = versionOf(latest, n);
      if (!entry) throw notFound('No such version.');
      if (entry.status !== 'ready') throw conflict('This version is still uploading.');
      return { currentVersion: entry.n, ...mirrorOf(entry) };
    });
    res.status(200).json({ file: updated });
  },
};

export { fileVersionsRestore };
