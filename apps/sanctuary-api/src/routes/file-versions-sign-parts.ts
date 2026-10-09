/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, fileSignPartsSchema } from '@rotp/hub-contracts';
import { badRequest, conflict, parseBody, requireMember } from '@rotp/hub-server';
import { loadVisibleFile } from '../files/file-guards';
import { recordVersionPartsDone } from '../files/parts-done';
import { assertUploader, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const fileVersionsSignParts: Route = {
  ...SANCTUARY_ROUTES.fileVersionsSignParts,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
    assertUploader(version, member);
    if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
    const { parts, partsDone } = parseBody(fileSignPartsSchema, req.body);
    const total = version.upload.parts;
    if (parts.some((part) => part > total)) throw badRequest(`This upload has ${total} parts.`);
    if (partsDone !== undefined) await recordVersionPartsDone(file.id, version.n, partsDone);
    const { multipartId } = version.upload;
    const urls = await Promise.all(
      parts.map(async (part) => ({ part, url: await filesBucket.signPart(version.key, multipartId, part) })),
    );
    res.status(200).json({ urls });
  },
};

export { fileVersionsSignParts };
