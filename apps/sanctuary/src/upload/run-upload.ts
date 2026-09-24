/* @layer sanctuary-site @kind logic */
/**
 * One file, start to finish: begin the record (a new file or the next version of one),
 * sign part URLs in batches of LIMITS.partsPerSign, PUT the batch in parallel, then
 * complete with the ETags in part order. A failure after begin aborts the record.
 */
import { LIMITS } from '@shared/sanctuary/limits';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { putPart } from './put-part';
import { beginUpload } from './begin-upload';
import type { UploadTarget } from './upload-job.type';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

type RunUploadParams = {
  file: File;
  target: UploadTarget;
  sha256: string | null;
  /** Called once the API has created the record, with the version number it gave. */
  onBegun: (fileId: string, n: number | null) => void;
  /** Total bytes sent so far, across every part. */
  onProgress: (sent: number) => void;
};

const partNumbers = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, i) => first + i);

const runUpload = async (params: RunUploadParams): Promise<SanctuaryFile> => {
  const { file, target, sha256, onBegun, onProgress } = params;
  const begun = await beginUpload(target, {
    name: file.name,
    bytes: file.size,
    sha256,
    contentType: file.type || DEFAULT_CONTENT_TYPE,
  });
  const { partSize, parts } = begun;
  onBegun(begun.fileId, begun.n);

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
      const { urls } = await begun.sign(batch);
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
    const { file: record } = await begun.complete(etags);
    return record;
  } catch (error) {
    await begun.abort().catch(() => undefined);
    throw error;
  }
};

export { runUpload };
export type { RunUploadParams };
