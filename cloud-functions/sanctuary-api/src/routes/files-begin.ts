/* @layer root-config @kind logic */
/** POST /files. Creates the record as uploading and starts the multipart
 *  upload; the browser then asks for part URLs in batches. */
import { LIMITS, SANCTUARY_ROUTES, createFileSchema } from '../../../../shared/sanctuary';
import type { SanctuaryFile } from '../../../../shared/sanctuary';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { filesRepo } from '../db/files-repo';
import { collection, now } from '../db/firestore';
import { b2, fileKey } from '../storage/b2';
import type { Route } from '../route.type';

const filesBegin: Route = {
  ...SANCTUARY_ROUTES.filesCreate,
  handler: async ({ req, res }) => {
    const { caller, user } = await requireAccess(req);
    const body = parseBody(createFileSchema, req.body);
    const id = collection('files').doc().id;
    const parts = Math.max(1, Math.ceil(body.bytes / LIMITS.partBytes));
    const multipartId = await b2.begin(fileKey(id), body.contentType);
    const file: SanctuaryFile = {
      id,
      type: body.type,
      tags: body.tags,
      version: body.version,
      name: body.name,
      bytes: body.bytes,
      sha256: body.sha256,
      contentType: body.contentType,
      note: body.note,
      owner: { userId: caller.userId, displayName: user.displayName },
      status: 'uploading',
      upload: { multipartId, parts },
      stats: { downloads: 0 },
      expiresAt: null,
      createdAt: now(),
    };
    await filesRepo.create(file);
    res.status(201).json({ fileId: id, uploadId: multipartId, partSize: LIMITS.partBytes, parts });
  },
};

export { filesBegin };
