/* @layer sanctuary-site @kind logic */
/**
 * One file, start to finish: begin the record, sign part URLs in batches of
 * LIMITS.partsPerSign, PUT the batch in parallel, then complete with the ETags in part
 * order. A failure after begin deletes the record, which aborts the multipart upload.
 */
import { LIMITS } from '@shared/sanctuary/limits';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { beginFile, completeFile, deleteFile, signParts } from '../api/files-endpoints';
import { putPart } from './put-part';
import type { UploadMeta } from './upload-job.type';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

type RunUploadParams = {
  file: File;
  meta: UploadMeta;
  sha256: string | null;
  /** Total bytes sent so far, across every part. */
  onProgress: (sent: number) => void;
};

const partNumbers = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => first + i);

const runUpload = async (params: RunUploadParams): Promise<SanctuaryFile> => {
  const { file, meta, sha256, onProgress } = params;
  const { fileId, partSize, parts } = await beginFile({
    ...meta,
    name: file.name,
    bytes: file.size,
    sha256,
    contentType: file.type || DEFAULT_CONTENT_TYPE,
  });

  const sentByPart = new Map<number, number>();
  const report = () => {
    let total = 0;
    for (const sent of sentByPart.values()) total += sent;
    onProgress(total);
  };

  try {
    const etags: string[] = new Array<string>(parts);
    for (let first = 1; first <= parts; first += LIMITS.partsPerSign) {
      const batch = partNumbers(first, Math.min(first + LIMITS.partsPerSign - 1, parts));
      const { urls } = await signParts(fileId, batch);
      await Promise.all(urls.map(async ({ part, url }) => {
        const blob = file.slice((part - 1) * partSize, Math.min(part * partSize, file.size));
        etags[part - 1] = await putPart({
          url,
          blob,
          onProgress: (loaded) => {
            sentByPart.set(part, loaded);
            report();
          },
        });
      }));
    }
    const { file: record } = await completeFile(fileId, etags);
    return record;
  } catch (error) {
    await deleteFile(fileId).catch(() => undefined);
    throw error;
  }
};

export { runUpload };
export type { RunUploadParams };
