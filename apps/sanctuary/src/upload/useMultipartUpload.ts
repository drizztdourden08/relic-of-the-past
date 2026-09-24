/* @layer sanctuary-site @kind hook */
/**
 * The upload list of the Files page. `start` takes the dropped files and the dialog's
 * answers, runs every file through hash, begin, parts and complete, and keeps one job row
 * per file with its progress. A finished record is handed back so the table can add it.
 */
import { useCallback, useMemo, useState } from 'react';
import { LIMITS } from '@shared/sanctuary/limits';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { errorMessage } from '../api/client';
import { formatBytes } from '../lib/format-bytes';
import { hashFile } from './hash-file';
import { runUpload } from './run-upload';
import type { UploadJob, UploadMeta } from './upload-job.type';

const useMultipartUpload = (onUploaded: (file: SanctuaryFile) => void) => {
  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const patch = useCallback((id: string, changes: Partial<UploadJob>) => {
    setJobs((rows) => rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }, []);

  const uploadOne = useCallback(async (job: UploadJob, file: File, meta: UploadMeta) => {
    if (file.size > LIMITS.fileBytes) {
      patch(job.id, { state: 'failed', error: `Larger than ${formatBytes(LIMITS.fileBytes)}.` });
      return;
    }
    try {
      const sha256 = await hashFile(file);
      patch(job.id, { state: 'uploading' });
      const record = await runUpload({
        file,
        meta,
        sha256,
        onProgress: (sent) => patch(job.id, { sent }),
      });
      patch(job.id, { state: 'done', sent: file.size, fileId: record.id });
      onUploaded(record);
    } catch (cause) {
      patch(job.id, { state: 'failed', error: errorMessage(cause) });
    }
  }, [patch, onUploaded]);

  const start = useCallback((files: File[], meta: UploadMeta) => {
    const next = files.map((file): [UploadJob, File] => [
      { id: crypto.randomUUID(), name: file.name, bytes: file.size, sent: 0, state: 'hashing', error: null, fileId: null },
      file,
    ]);
    setJobs((rows) => [...next.map(([job]) => job), ...rows]);
    for (const [job, file] of next) void uploadOne(job, file, meta);
  }, [uploadOne]);

  const dismiss = useCallback((id: string) => {
    setJobs((rows) => rows.filter((row) => row.id !== id));
  }, []);

  return useMemo(() => ({ jobs, start, dismiss }), [jobs, start, dismiss]);
};

export { useMultipartUpload };
