/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { loadReadyFile } from '../files/upload-routes';
import { currentVersionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';

const filesDownload: Route = {
  ...SANCTUARY_ROUTES.filesDownload,
  handler: async (ctx) => {
    const { file } = await loadReadyFile(ctx);
    const url = await filesBucket.signDownload(currentVersionOf(file).key, file.name);
    await filesRepo.bumpDownloads(file.id);
    ctx.res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { filesDownload };
