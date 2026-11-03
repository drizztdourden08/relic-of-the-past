/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { UploadedPartsResponse } from '@rotp/hub-contracts';
import type { Route } from '@rotp/hub-server';
import { loadUploadingVersion } from '../items/version-routes';
import { storeBucket } from '../storage/store-bucket';

const versionsParts: Route = {
  ...STORE_ROUTES.versionsParts,
  handler: async (ctx) => {
    const { version, upload } = await loadUploadingVersion(ctx);
    const body: UploadedPartsResponse = { parts: await storeBucket.listParts(version.key, upload.multipartId) };
    ctx.res.status(200).json(body);
  },
};

export { versionsParts };
