/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { completeUpload, loadUploadingFile } from '../files/upload-routes';
import { currentVersionOf, replaceVersion } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import type { Route } from '@rotp/hub-server';

const filesComplete: Route = {
  ...SANCTUARY_ROUTES.filesComplete,
  handler: async (ctx) => {
    const { file, upload } = await loadUploadingFile(ctx);
    const version = currentVersionOf(file);
    await completeUpload(ctx.req.body, { key: version.key, bytes: file.bytes, upload }, async () => {
      await filesRepo.update(file.id, { status: 'deleted', upload: null });
    });
    const versions = replaceVersion(file, { ...version, status: 'ready', upload: null });
    await filesRepo.update(file.id, { status: 'ready', upload: null, versions });
    ctx.res.status(200).json({ file: { ...file, status: 'ready', upload: null, versions } });
  },
};

export { filesComplete };
