/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES, createFileSchema } from '@rotp/hub-contracts';
import type { FileOwner, SanctuaryFile } from '@rotp/hub-contracts';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { assertVisibleType } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { now } from '../../../hub-core/db/firestore';
import { sanctuaryCollection } from '../db/collections';
import { filesBucket } from '../storage/files-bucket';
import { versionKey } from '../storage/keys';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';
import { FIRST_VERSION } from './files-begin.constants';

const filesBegin: Route = {
  ...SANCTUARY_ROUTES.filesCreate,
  handler: async ({ req, res }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const body = parseBody(createFileSchema, req.body);
    assertVisibleType(body.type, member);
    const id = sanctuaryCollection('files').doc().id;
    const key = versionKey(id, FIRST_VERSION);
    const parts = Math.max(1, Math.ceil(body.bytes / LIMITS.partBytes));
    const multipartId = await filesBucket.begin(key, body.contentType);
    const owner: FileOwner = { userId: member.caller.userId, displayName: member.user.displayName };
    const createdAt = now();
    const upload = { multipartId, parts, partsDone: 0, updatedAt: createdAt };
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
