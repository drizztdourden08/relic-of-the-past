/* @layer sanctuary-site @kind constants */
import { LIMITS } from '@rotp/hub-contracts';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { hashFile } from '@site-kit/upload/hash-file';
import { fileSteps } from '@site-kit/upload/upload-steps';
import type { UploadRunner } from '@site-kit/upload/upload-runner.type';
import { versionLabel } from '../files/file-versions';
import { beginUpload } from './begin-upload';
import { bindUpload } from './bind-upload';
import type { UploadTarget } from './upload-target.type';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

const SANCTUARY_UPLOADER: UploadRunner<UploadTarget, SanctuaryFile> = {
  site: 'sanctuary',
  maxBytes: LIMITS.fileBytes,
  pick: (files, target) => (target.kind === 'version' ? files.slice(0, 1) : files),
  labelOf: (target, file, n) => (target.kind === 'new' ? file?.name ?? 'File' : `${versionLabel(n ?? target.next)} of ${target.of}`),
  titleOf: (target, file) => `Uploading ${target.kind === 'new' ? file?.name ?? 'a file' : target.of}`,
  stepsOf: () => fileSteps(),
  hash: hashFile,
  begin: (target, file, sha256) =>
    beginUpload(target, { name: file.name, bytes: file.size, sha256, contentType: file.type || DEFAULT_CONTENT_TYPE }),
  bind: (_target, resume) => bindUpload(resume),
};

export { SANCTUARY_UPLOADER };
