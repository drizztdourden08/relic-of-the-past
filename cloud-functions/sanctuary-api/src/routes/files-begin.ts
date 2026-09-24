/* @layer root-config @kind logic */
/** POST /files. Creates the record as uploading, with its version 1, and starts
 *  the multipart upload; the browser then asks for part URLs in batches. Only a
 *  type the caller can see takes an upload. */
import { LIMITS, SANCTUARY_ROUTES, createFileSchema } from '../../../../shared/sanctuary';
import type { FileOwner, SanctuaryFile } from '../../../../shared/sanctuary';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { assertVisibleType } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { collection, now } from '../db/firestore';
import { b2, versionKey } from '../storage/b2';
import type { Route } from '../route.type';

const FIRST_VERSION = 1;

const filesBegin: Route = {
  ...SANCTUARY_ROUTES.filesCreate,
  handler: async ({ req, res }) => {
    const member = await requireAccess(req);
    const body = parseBody(createFileSchema, req.body);
    assertVisibleType(body.type, member);
    const id = collection('files').doc().id;
    const key = versionKey(id, FIRST_VERSION);
    const parts = Math.max(1, Math.ceil(body.bytes / LIMITS.partBytes));
    const multipartId = await b2.begin(key, body.contentType);
    const owner: FileOwner = { userId: member.caller.userId, displayName: member.user.displayName };
    const upload = { multipartId, parts };
    const createdAt = now();
    const { name, bytes, sha256, contentType } = body;
    const file: SanctuaryFile = {
      id,
      type: body.type,
      tags: body.tags,
      version: body.version,
      name,
      bytes,
      sha256,
      contentType,
      versions: [
        { n: FIRST_VERSION, key, name, bytes, sha256, contentType, note: '', by: owner, status: 'uploading', upload, createdAt },
      ],
      currentVersion: FIRST_VERSION,
      note: body.note,
      owner,
      status: 'uploading',
      upload,
      stats: { downloads: 0 },
      expiresAt: null,
      createdAt,
    };
    await filesRepo.create(file);
    res.status(201).json({ fileId: id, uploadId: multipartId, partSize: LIMITS.partBytes, parts });
  },
};

export { filesBegin };
