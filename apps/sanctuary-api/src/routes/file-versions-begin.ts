/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES, beginVersionSchema } from '@rotp/hub-contracts';
import type { FileVersion } from '@rotp/hub-contracts';
import { conflict, parseBody, requireMember, now } from '@rotp/hub-server';
import { loadVisibleFile } from '../files/file-guards';
import { lastVersionNumber } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import { versionKey } from '../storage/keys';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const fileVersionsBegin: Route = {
  ...SANCTUARY_ROUTES.fileVersionsBegin,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    if (file.status !== 'ready') throw conflict('This file is still uploading.');
    const body = parseBody(beginVersionSchema, req.body);
    const n = lastVersionNumber(file) + 1;
    const key = versionKey(file.id, n);
    const parts = Math.max(1, Math.ceil(body.bytes / LIMITS.partBytes));
    const multipartId = await filesBucket.begin(key, body.contentType);
    const createdAt = now();
    const version: FileVersion = {
      n,
      key,
      name: body.name,
      bytes: body.bytes,
      sha256: body.sha256,
      contentType: body.contentType,
      note: body.note,
      by: { userId: member.caller.userId, displayName: member.user.displayName },
      status: 'uploading',
      upload: { multipartId, parts, partsDone: 0, updatedAt: createdAt },
      createdAt,
    };
    try {
      await filesRepo.mutate(file.id, (latest) => {
        if (lastVersionNumber(latest) + 1 !== n) throw conflict('Another version started at the same time. Try again.');
        return { versions: [...latest.versions, version], currentVersion: latest.currentVersion };
      });
    } catch (err) {
      await filesBucket.abort(key, multipartId).catch(() => undefined);
      throw err;
    }
    res.status(201).json({ fileId: file.id, n, uploadId: multipartId, partSize: LIMITS.partBytes, parts });
  },
};

export { fileVersionsBegin };
