/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import type { UploadedParts } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { loadVisibleFile } from '../files/file-guards';
import { assertUploader, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const fileVersionsParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    assertUploader(version, member);
    if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const body: UploadedParts = { parts: await filesBucket.listParts(version.key, version.upload.multipartId) };
    res.status(200).json(body);
  },
};

export { fileVersionsParts };
