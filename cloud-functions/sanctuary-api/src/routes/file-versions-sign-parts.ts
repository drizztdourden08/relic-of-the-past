/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/parts { parts: [n..m] }. Presigned PUT URLs for
 *  a batch of the version's parts, for the person uploading it only. */
import { SANCTUARY_ROUTES, signPartsSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { assertUploader, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const fileVersionsSignParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    assertUploader(version, member);
    if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { parts } = parseBody(signPartsSchema, req.body);
    const total = version.upload.parts;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    const { multipartId } = version.upload;
    const urls = await Promise.all(
      parts.map(async (part) => ({ part, url: await filesBucket.signPart(version.key, multipartId, part) })),
    );
    res.status(200).json({ urls });
  },
};

export { fileVersionsSignParts };
