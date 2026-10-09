/* @layer sanctuary-site @kind logic */
import type { UploadResume } from '@site-kit/upload/upload-job.type';
import { beginFile } from '../api/files-endpoints';
import { beginVersion } from '../api/versions-endpoints';
import type { UploadTarget } from './upload-target.type';
import type { UploadFacts } from './begin-upload.type';

const beginUpload = async (target: UploadTarget, facts: UploadFacts): Promise<UploadResume> => {
  if (target.kind === 'new') {
    const { fileId, partSize, parts } = await beginFile({ ...target.meta, ...facts });
    return { recordId: fileId, n: null, partSize, parts };
  }
  const { n, partSize, parts } = await beginVersion(target.fileId, { ...facts, note: target.note });
  return { recordId: target.fileId, n, partSize, parts };
};

export { beginUpload };
