/* @layer root-config @kind logic */
/** POST /files/:id/versions/:n/parts { parts: [n..m] }. Presigned PUT URLs for
 *  a batch of the version's parts, for the person uploading it only. */
import { SANCTUARY_ROUTES, signPartsSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { loadVisibleFile } from '../files/file-guards';
import { assertUploader, loadVersion } from '../files/versions';
import { b2 } from '../storage/b2';
import type { Route } from '../route.type';

const fileVersionsSignParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    assertUploader(version, member);
    if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { parts } = parseBody(signPartsSchema, req.body);
    const total = version.upload.parts;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    const { multipartId } = version.upload;
    const urls = await Promise.all(
      parts.map(async (part) => ({ part, url: await b2.signPart(version.key, multipartId, part) })),
    );
    res.status(200).json({ urls });
  },
};

export { fileVersionsSignParts };
