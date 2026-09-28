/* @layer sanctuary-site @kind logic */
/**
 * The two ends of an upload, per target. A new file and a new version begin on different
 * routes and sign, list, complete and abort on different routes after that. `beginUpload`
 * opens the record and answers what a reload needs to find it again; `bindUpload` hands
 * back the later steps bound to that record, so the part loop never asks which kind it runs.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { BegunMultipart } from '@shared/hub/upload/run-multipart';
import type { UploadResume } from '@site-kit/upload/upload-job.type';
import { beginFile, completeFile, deleteFile, fileParts, signParts } from '../api/files-endpoints';
import { beginVersion, completeVersion, deleteVersion, signVersionParts, versionParts } from '../api/versions-endpoints';
import type { UploadTarget } from './upload-target.type';

/** The facts of the bytes, the same for either target. */
type UploadFacts = {
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
};

const beginUpload = async (target: UploadTarget, facts: UploadFacts): Promise<UploadResume> => {
  if (target.kind === 'new') {
    const { fileId, partSize, parts } = await beginFile({ ...target.meta, ...facts });
    return { recordId: fileId, n: null, partSize, parts };
  }
  const { n, partSize, parts } = await beginVersion(target.fileId, { ...facts, note: target.note });
  return { recordId: target.fileId, n, partSize, parts };
};

/** A resume with no version number is a new file's first upload. */
const bindUpload = (resume: UploadResume): BegunMultipart<SanctuaryFile> => {
  const { recordId: fileId, n, partSize, parts } = resume;
  if (n === null) {
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

export { beginUpload, bindUpload };
export type { UploadFacts };
