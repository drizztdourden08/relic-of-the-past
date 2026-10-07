/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/download. A presigned GET for one version, ten
 *  minutes, named with that version's own file name. Counts as a download. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { loadVersion } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const fileVersionsDownload: Route = {
  ...SANCTUARY_ROUTES.fileVersionsDownload,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    if (file.status !== 'ready' || version.status !== 'ready') throw conflict('This version is still uploading.');
    const url = await filesBucket.signDownload(version.key, version.name);
    await filesRepo.bumpDownloads(file.id);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { fileVersionsDownload };
