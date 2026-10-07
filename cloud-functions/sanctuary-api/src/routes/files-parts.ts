/* @layer root-config @kind logic */
/** GET /files/:id/parts. The parts of a file's first upload already in the bucket, for its
 *  owner only, so an upload cut off by a reload sends only what is missing. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { UploadedParts } from '../../../../shared/hub';
import { conflict } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
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
