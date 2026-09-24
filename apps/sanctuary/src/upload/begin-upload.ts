/* @layer sanctuary-site @kind logic */
/**
 * The first step of an upload, per target. A new file and a new version begin on
 * different routes and sign, complete and abort on different routes after that; each
 * begin hands back the three later steps already bound to the record, so the part loop
 * never asks which kind it is running.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { beginFile, completeFile, deleteFile, signParts } from '../api/files-endpoints';
import { beginVersion, completeVersion, deleteVersion, signVersionParts } from '../api/versions-endpoints';
import type { SignPartsResponse } from '../api/types';
import type { UploadMeta, UploadTarget } from './upload-job.type';

/** The facts of the bytes, the same for either target. */
type UploadFacts = {
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
};

type BegunUpload = {
  fileId: string;
  /** The version number the API gave; null for a new file. */
  n: number | null;
  partSize: number;
  parts: number;
  sign: (parts: number[]) => Promise<SignPartsResponse>;
  complete: (etags: string[]) => Promise<{ file: SanctuaryFile }>;
  /** Drops the record, which aborts the multipart upload. */
  abort: () => Promise<unknown>;
};

const beginNewFile = async (meta: UploadMeta, facts: UploadFacts): Promise<BegunUpload> => {
  const { fileId, partSize, parts } = await beginFile({ ...meta, ...facts });
  return {
    fileId,
    n: null,
    partSize,
    parts,
    sign: (batch) => signParts(fileId, batch),
    complete: (etags) => completeFile(fileId, etags),
    abort: () => deleteFile(fileId),
  };
};

const beginNextVersion = async (fileId: string, note: string, facts: UploadFacts): Promise<BegunUpload> => {
  const { n, partSize, parts } = await beginVersion(fileId, { ...facts, note });
  return {
    fileId,
    n,
    partSize,
    parts,
    sign: (batch) => signVersionParts(fileId, n, batch),
    complete: (etags) => completeVersion(fileId, n, etags),
    abort: () => deleteVersion(fileId, n),
  };
};

const beginUpload = (target: UploadTarget, facts: UploadFacts): Promise<BegunUpload> =>
  target.kind === 'new'
    ? beginNewFile(target.meta, facts)
    : beginNextVersion(target.fileId, target.note, facts);

export { beginUpload };
export type { UploadFacts, BegunUpload };
