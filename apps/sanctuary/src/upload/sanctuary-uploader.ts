/* @layer sanctuary-site @kind logic */
/**
 * How the Sanctuary uploads one file: a new file or the next version of one, capped at
 * LIMITS.fileBytes, begun on the file or version route and then run through the shared
 * multipart loop, one part PUT at a time to its presigned URL. A version target takes the
 * first dropped file only: one upload is one version.
 */
import { LIMITS } from '@shared/sanctuary/limits';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { runMultipart } from '@shared/hub/upload/run-multipart';
import { putPart } from '@site-kit/upload/put-part';
import type { UploadRunner } from '@site-kit/upload/upload-runner.type';
import { versionLabel } from '../files/file-versions';
import { beginUpload } from './begin-upload';
import type { UploadTarget } from './upload-target.type';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

const SANCTUARY_UPLOADER: UploadRunner<UploadTarget, SanctuaryFile> = {
  maxBytes: LIMITS.fileBytes,
  labelOf: (file, target, n) => (target.kind === 'new' ? file.name : `${versionLabel(n ?? target.next)} of ${target.of}`),
  pick: (files, target) => (target.kind === 'version' ? files.slice(0, 1) : files),
  recordIdOf: (record) => record.id,
  run: async ({ file, target, sha256, onBegun, onProgress }) => {
    const facts = { name: file.name, bytes: file.size, sha256, contentType: file.type || DEFAULT_CONTENT_TYPE };
    const { file: record } = await runMultipart({
      source: file,
      begin: async () => {
        const begun = await beginUpload(target, facts);
        onBegun(begun.fileId, begun.n);
        return begun;
      },
      put: (url, blob, onPart) => putPart({ url, blob, onProgress: onPart }),
      onProgress,
    });
    return record;
  },
};

export { SANCTUARY_UPLOADER };
