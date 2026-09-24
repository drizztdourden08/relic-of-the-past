/* @layer root-config @kind logic */
/** POST /files/:id/download. Bumps the counter and returns a presigned GET,
 *  ten minutes, with the original name in the content disposition. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { loadFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { b2, fileKey } from '../storage/b2';
import type { Route } from '../route.type';

const filesDownload: Route = {
  ...SANCTUARY_ROUTES.filesDownload,
  handler: async ({ req, res, params }) => {
    await requireAccess(req);
    const file = await loadFile(params.id);
    if (file.status !== 'ready') throw conflict('This file is still uploading.');
    const url = await b2.signDownload(fileKey(file.id), file.name);
    await filesRepo.bumpDownloads(file.id);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { filesDownload };
