/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, fileSignPartsSchema } from '@rotp/hub-contracts';
import { badRequest, conflict } from '@rotp/hub-server';
import { parseBody } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { assertOwner, loadVisibleFile } from '../files/file-guards';
import { recordFilePartsDone } from '../files/parts-done';
import { currentVersionOf } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const filesSignParts: Route = {
  ...SANCTUARY_ROUTES.filesSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwner(file, member);
    if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
    const { parts, partsDone } = parseBody(fileSignPartsSchema, req.body);
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
