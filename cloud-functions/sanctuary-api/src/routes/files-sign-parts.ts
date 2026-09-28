/* @layer root-config @kind logic */
/** POST /files/:id/parts { parts: [n..m], partsDone? }. Presigned PUT URLs for a batch of
 *  part numbers of the first upload, each bound to its upload id, one hour each.
 *  `partsDone` is how many parts the uploader already has up; the record keeps it. */
import { SANCTUARY_ROUTES, signPartsSchema } from '../../../../shared/sanctuary';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { recordFilePartsDone } from '../files/parts-done';
import { currentVersionOf } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const filesSignParts: Route = {
  ...SANCTUARY_ROUTES.filesSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { parts, partsDone } = parseBody(signPartsSchema, req.body);
    const total = file.upload.parts;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    if (partsDone !== undefined) await recordFilePartsDone(file.id, partsDone);
    const { multipartId } = file.upload;
    const { key } = currentVersionOf(file);
    const urls = await Promise.all(parts.map(async (part) => ({ part, url: await filesBucket.signPart(key, multipartId, part) })));
    res.status(200).json({ urls });
  },
};

export { filesSignParts };
