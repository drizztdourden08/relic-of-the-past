/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
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
