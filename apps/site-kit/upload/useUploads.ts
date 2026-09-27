/* @layer site-kit @kind hook */
/**
 * The upload list of a page. `start` takes the dropped files and where they go, runs every
 * file through hash, begin, parts and complete with the site's runner, and keeps one job
 * row per file with its progress. A finished record is handed back so the page can add or
 * replace it.
 */
import { useCallback, useMemo, useState } from 'react';
import { errorMessage } from '../api/api-error';
import { formatBytes } from '../lib/format-bytes';
import { hashFile } from './hash-file';
import type { UploadJob } from './upload-job.type';
import type { UploadRunner } from './upload-runner.type';

const isFinished = (job: UploadJob) => job.state === 'done' || job.state === 'failed';

const useUploads = <T, R>(runner: UploadRunner<T, R>, onUploaded: (record: R) => void) => {
  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const patch = useCallback((id: string, changes: Partial<UploadJob>) => {
    setJobs((rows) => rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }, []);

  const newJob = useCallback((file: File, target: T): UploadJob => ({
    id: crypto.randomUUID(),
    label: runner.labelOf(file, target),
    bytes: file.size,
    sent: 0,
    state: 'hashing',
    error: null,
    fileId: null,
  }), [runner]);

  const uploadOne = useCallback(async (job: UploadJob, file: File, target: T) => {
    if (file.size > runner.maxBytes) {
      patch(job.id, { state: 'failed', error: `Larger than ${formatBytes(runner.maxBytes)}.` });
      return;
    }
    try {
      const sha256 = await hashFile(file);
      patch(job.id, { state: 'uploading' });
      const record = await runner.run({
        file,
        target,
        sha256,
        onBegun: (fileId, n) => patch(job.id, { fileId, label: runner.labelOf(file, target, n) }),
        onProgress: (sent) => patch(job.id, { sent }),
      });
      patch(job.id, { state: 'done', sent: file.size, fileId: runner.recordIdOf(record) });
      onUploaded(record);
    } catch (cause) {
      patch(job.id, { state: 'failed', error: errorMessage(cause) });
    }
  }, [patch, onUploaded, runner]);

  const start = useCallback((files: File[], target: T) => {
    const next = runner.pick(files, target).map((file): [UploadJob, File] => [newJob(file, target), file]);
    setJobs((rows) => [...next.map(([job]) => job), ...rows]);
    for (const [job, file] of next) void uploadOne(job, file, target);
  }, [uploadOne, newJob, runner]);

  const dismiss = useCallback((id: string) => {
    setJobs((rows) => rows.filter((row) => row.id !== id));
  }, []);

  /** Drops every row that is over, done or failed; the ones still moving stay. */
  const clearFinished = useCallback(() => {
    setJobs((rows) => rows.filter((row) => !isFinished(row)));
  }, []);

  return useMemo(() => ({ jobs, start, dismiss, clearFinished }), [jobs, start, dismiss, clearFinished]);
};

export { useUploads, isFinished };
