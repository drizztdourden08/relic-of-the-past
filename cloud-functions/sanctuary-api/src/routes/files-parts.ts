/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import type { UploadedParts } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const filesParts: Route = {
  ...SANCTUARY_ROUTES.filesParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { key } = currentVersionOf(file);
    const body: UploadedParts = { parts: await filesBucket.listParts(key, file.upload.multipartId) };
    res.status(200).json(body);
  },
};

export { filesParts };
