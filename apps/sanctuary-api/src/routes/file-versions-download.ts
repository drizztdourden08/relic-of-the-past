/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { loadMemberVersion } from '../files/upload-routes';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';

const fileVersionsDownload: Route = {
  ...SANCTUARY_ROUTES.fileVersionsDownload,
  handler: async (ctx) => {
    const { file, version } = await loadMemberVersion(ctx);
    if (file.status !== 'ready' || version.status !== 'ready') throw conflict('This version is still uploading.');
    const url = await filesBucket.signDownload(version.key, version.name);
    await filesRepo.bumpDownloads(file.id);
    ctx.res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { fileVersionsDownload };
