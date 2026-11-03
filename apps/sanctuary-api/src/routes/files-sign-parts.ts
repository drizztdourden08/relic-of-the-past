/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { loadUploadingFile, signRequestedParts } from '../files/upload-routes';
import { recordFilePartsDone } from '../files/parts-done';
import { currentVersionOf } from '../files/versions';
import type { Route } from '@rotp/hub-server';

const filesSignParts: Route = {
  ...SANCTUARY_ROUTES.filesSignParts,
  handler: async (ctx) => {
    const { file, upload } = await loadUploadingFile(ctx);
    const { key } = currentVersionOf(file);
    const signed = await signRequestedParts(ctx.req.body, key, upload, (done) => recordFilePartsDone(file.id, done));
    ctx.res.status(200).json(signed);
  },
};

export { filesSignParts };
