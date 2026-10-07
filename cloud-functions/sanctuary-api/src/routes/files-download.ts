/* @layer root-config @kind logic */
/** POST /files/:id/download. Bumps the counter and returns a presigned GET for
 *  the current version, ten minutes, with its name in the content disposition. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { b2 } from '../storage/b2';
import type { Route } from '../route.type';

const filesDownload: Route = {
  ...SANCTUARY_ROUTES.filesDownload,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    if (file.status !== 'ready') throw conflict('This file is still uploading.');
    const url = await b2.signDownload(currentVersionOf(file).key, file.name);
    await filesRepo.bumpDownloads(file.id);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { filesDownload };
