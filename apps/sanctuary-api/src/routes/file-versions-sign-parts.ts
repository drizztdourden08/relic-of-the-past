/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { loadUploadingVersion, signRequestedParts } from '../files/upload-routes';
import { recordVersionPartsDone } from '../files/parts-done';
import type { Route } from '@rotp/hub-server';

const fileVersionsSignParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsSignParts,
  handler: async (ctx) => {
    const { file, version, upload } = await loadUploadingVersion(ctx);
    const signed = await signRequestedParts(ctx.req.body, version.key, upload, (done) =>
      recordVersionPartsDone(file.id, version.n, done),
    );
    ctx.res.status(200).json(signed);
  },
};

export { fileVersionsSignParts };
