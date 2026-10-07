/* @layer root-config @kind logic */
/** GET /files/:id/versions/:n/parts. The parts of an uploading version already in the
 *  bucket, for the person uploading it only, so a resumed upload sends only what is missing. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { UploadedParts } from '../../../../shared/hub';
import { conflict } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { assertUploader, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
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
