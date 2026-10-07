/* @layer sanctuary-site @kind hook */
/**
 * The upload list of the Files page. `start` takes the dropped files and where they go
 * (new files with the dialog's answers, or the next version of one file), runs every
 * file through hash, begin, parts and complete, and keeps one job row per file with its
 * progress. A finished record is handed back so the table can add or replace it.
 */
import { useCallback, useMemo, useState } from 'react';
import { LIMITS } from '@shared/sanctuary/limits';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { errorMessage } from '../api/client';
import { formatBytes } from '../lib/format-bytes';
import { versionLabel } from '../files/file-versions';
import { hashFile } from './hash-file';
import { runUpload } from './run-upload';
import type { UploadJob, UploadTarget } from './upload-job.type';

const labelOf = (file: File, target: UploadTarget, n?: number | null) =>
  (target.kind === 'new' ? file.name : `${versionLabel(n ?? target.next)} of ${target.of}`);

const newJob = (file: File, target: UploadTarget): UploadJob => ({
  id: crypto.randomUUID(),
  label: labelOf(file, target),
  bytes: file.size,
  sent: 0,
  state: 'hashing',
  error: null,
  fileId: null,
});

const isFinished = (job: UploadJob) => job.state === 'done' || job.state === 'failed';

const useMultipartUpload = (onUploaded: (file: SanctuaryFile) => void) => {
  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const patch = useCallback((id: string, changes: Partial<UploadJob>) => {
    setJobs((rows) => rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }, []);

  const uploadOne = useCallback(async (job: UploadJob, file: File, target: UploadTarget) => {
    if (file.size > LIMITS.fileBytes) {
      patch(job.id, { state: 'failed', error: `Larger than ${formatBytes(LIMITS.fileBytes)}.` });
      return;
    }
    try {
      const sha256 = await hashFile(file);
      patch(job.id, { state: 'uploading' });
      const record = await runUpload({
        file,
        target,
        sha256,
        onBegun: (fileId, n) => patch(job.id, { fileId, label: labelOf(file, target, n) }),
        onProgress: (sent) => patch(job.id, { sent }),
      });
      patch(job.id, { state: 'done', sent: file.size, fileId: record.id });
      onUploaded(record);
    } catch (cause) {
      patch(job.id, { state: 'failed', error: errorMessage(cause) });
    }
  }, [patch, onUploaded]);

  /** A version target takes the first file only: one upload is one version. */
  const start = useCallback((files: File[], target: UploadTarget) => {
    const chosen = target.kind === 'version' ? files.slice(0, 1) : files;
    const next = chosen.map((file): [UploadJob, File] => [newJob(file, target), file]);
    setJobs((rows) => [...next.map(([job]) => job), ...rows]);
    for (const [job, file] of next) void uploadOne(job, file, target);
  }, [uploadOne]);

  const dismiss = useCallback((id: string) => {
    setJobs((rows) => rows.filter((row) => row.id !== id));
  }, []);

  /** Drops every row that is over, done or failed; the ones still moving stay. */
  const clearFinished = useCallback(() => {
    setJobs((rows) => rows.filter((row) => !isFinished(row)));
  }, []);

  return useMemo(() => ({ jobs, start, dismiss, clearFinished }), [jobs, start, dismiss, clearFinished]);
};

export { useMultipartUpload, isFinished };
