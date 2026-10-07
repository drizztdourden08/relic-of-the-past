/* @layer root-config @kind logic */
/** POST /files/:id/download. Bumps the counter and returns a presigned GET for
 *  the current version, ten minutes, with its name in the content disposition. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const filesDownload: Route = {
  ...SANCTUARY_ROUTES.filesDownload,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    if (file.status !== 'ready') throw conflict('This file is still uploading.');
    const url = await filesBucket.signDownload(currentVersionOf(file).key, file.name);
    await filesRepo.bumpDownloads(file.id);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { filesDownload };
