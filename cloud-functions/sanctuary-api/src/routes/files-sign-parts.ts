/* @layer root-config @kind logic */
/** POST /files/:id/parts { parts: [n..m] }. Presigned PUT URLs for a batch of
 *  part numbers of the first upload, each bound to its upload id, one hour each. */
import { SANCTUARY_ROUTES, signPartsSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { currentVersionOf } from '../files/versions';
import { b2 } from '../storage/b2';
import type { Route } from '../route.type';

const filesSignParts: Route = {
  ...SANCTUARY_ROUTES.filesSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { parts } = parseBody(signPartsSchema, req.body);
    const total = file.upload.parts;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    const { multipartId } = file.upload;
    const { key } = currentVersionOf(file);
    const urls = await Promise.all(parts.map(async (part) => ({ part, url: await b2.signPart(key, multipartId, part) })));
    res.status(200).json({ urls });
  },
};

export { filesSignParts };
