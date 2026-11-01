/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { listUploadedParts, loadUploadingVersion } from '../files/upload-routes';
import type { Route } from '@rotp/hub-server';

const fileVersionsParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsParts,
  handler: async (ctx) => {
    const { version, upload } = await loadUploadingVersion(ctx);
    ctx.res.status(200).json(await listUploadedParts(version.key, upload));
  },
};

export { fileVersionsParts };
