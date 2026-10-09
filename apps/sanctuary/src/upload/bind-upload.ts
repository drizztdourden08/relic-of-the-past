/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { BegunMultipart } from '@rotp/hub-contracts';
import type { UploadResume } from '@site-kit/upload/upload-job.type';
import { completeFile, deleteFile, fileParts, signParts } from '../api/files-endpoints';
import { completeVersion, deleteVersion, signVersionParts, versionParts } from '../api/versions-endpoints';

const bindUpload = (resume: UploadResume): BegunMultipart<SanctuaryFile> => {
  const { recordId: fileId, n, partSize, parts } = resume;
  const isFirstUpload = n === null;
  if (isFirstUpload) {
    return {
      partSize,
      parts,
      sign: (batch, partsDone) => signParts(fileId, batch, partsDone),
      complete: async (etags) => (await completeFile(fileId, etags)).file,
      abort: () => deleteFile(fileId),
      listParts: async () => (await fileParts(fileId)).parts,
    };
  }
  return {
    partSize,
    parts,
    sign: (batch, partsDone) => signVersionParts(fileId, n, batch, partsDone),
    complete: async (etags) => (await completeVersion(fileId, n, etags)).file,
    abort: () => deleteVersion(fileId, n),
    listParts: async () => (await versionParts(fileId, n)).parts,
  };
};

export { bindUpload };
