/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { listUploadedParts, loadUploadingFile } from '../files/upload-routes';
import { currentVersionOf } from '../files/versions';
import type { Route } from '@rotp/hub-server';

const filesParts: Route = {
  ...SANCTUARY_ROUTES.filesParts,
  handler: async (ctx) => {
    const { file, upload } = await loadUploadingFile(ctx);
    ctx.res.status(200).json(await listUploadedParts(currentVersionOf(file).key, upload));
  },
};

export { filesParts };
