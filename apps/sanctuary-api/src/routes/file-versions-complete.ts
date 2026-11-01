/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { completeUpload, loadUploadingVersion } from '../files/upload-routes';
import { mirrorOf, replaceVersion, versionOf } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import type { Route } from '@rotp/hub-server';

const fileVersionsComplete: Route = {
  ...SANCTUARY_ROUTES.fileVersionsComplete,
  handler: async (ctx) => {
    const { file, version, upload } = await loadUploadingVersion(ctx);
    await completeUpload(ctx.req.body, { key: version.key, bytes: version.bytes, upload }, async () => {
      await filesRepo.mutate(file.id, (latest) => ({ versions: latest.versions.filter((entry) => entry.n !== version.n) }));
    });
    const updated = await filesRepo.mutate(file.id, (latest) => {
      const entry = versionOf(latest, version.n);
      if (!entry) throw notFound('No such version.');
      const ready = { ...entry, status: 'ready' as const, upload: null };
      return { versions: replaceVersion(latest, ready), currentVersion: ready.n, ...mirrorOf(ready) };
    });
    ctx.res.status(200).json({ file: updated });
  },
};

export { fileVersionsComplete };
