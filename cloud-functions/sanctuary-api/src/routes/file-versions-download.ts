/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/download. A presigned GET for one version, ten
 *  minutes, named with that version's own file name. Counts as a download. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { loadVisibleFile } from '../files/file-guards';
import { loadVersion } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { b2 } from '../storage/b2';
import type { Route } from '../route.type';

const fileVersionsDownload: Route = {
  ...SANCTUARY_ROUTES.fileVersionsDownload,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    if (file.status !== 'ready' || version.status !== 'ready') throw conflict('This version is still uploading.');
    const url = await b2.signDownload(version.key, version.name);
    await filesRepo.bumpDownloads(file.id);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { fileVersionsDownload };
